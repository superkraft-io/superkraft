/************

sk_ui_iceRinkVirtual: an ice rink (drag, wheel, rubber band, overscroll) that keeps only the items
near the viewport in the DOM, for lists too long to render whole. Vertical only.

Items sit in a pool of absolutely positioned slots inside one track (the list's full height).
Slots are made once, reused and never reordered: inserting or removing siblings makes the browser
restyle every sibling (with a large stylesheet, tens of ms per change), changing what is inside a
slot doesn't. Each slot wraps its item's margins, so it measures the item whole.

Items can be any height and change height while shown. An item is estimated until it has been
shown, then measured; when an item above the viewport turns out taller or shorter than thought,
the scroll position follows so the view stays put.

Items are known by key, not index: data that shifts (an item added at the top) keeps the items
already built.

Building real items can be slow. With renderPlaceholder set, an item first shows as a cheap
placeholder (plain DOM, same height) and is built in the background a few ms per frame, items in
view first, so scrolling never waits for it. Items that leave are released in the same budget.

    rink.keyOf = index => key                 stable identity of item `index`
    rink.renderItem = index => item           build item `index` with rink.content.add (it lands in its slot)
    rink.renderPlaceholder = index => el      optional: a cheap stand-in shown until the item is built
                                              (give it rink.heightOf(index) as its height)
    rink.releaseItem = (item, key) => {}      the item is no longer needed (default: remove it)
    rink.isKept = key => bool                 optional: keep the item alive, detached, while out of view
                                              (an open player keeps playing)
    rink.estimateItem = index => px           optional guess for items never shown (default: learned
                                              from the first items shown)
    rink.onRendered = shown => {}             the built items shown changed: [{index, key, item}] in order
    rink.overscan = px                        shown beyond the viewport, each side
    rink.workBudget = ms                      background building / releasing per frame
    rink.fastScrollSpeed = px/ms              scrolling faster than this, placeholders stay placeholders
    rink.slowBuildCost = ms                   items that build slower than this (a slow computer) are
                                              built only once scrolling stops

    rink.setCount(n)                          item count; call after any data change
    rink.setCount(n, {raised, onEnd})         the same, the shown items sliding from where they were
                                              drawn to their new places (a re-sort), over slideDuration
                                              ms: raised (a Set of keys) drawn above the others
                                              meanwhile, ones gone from the list fading out where they
                                              were; onEnd once there (or cut short by another change)
    rink.endSlide()                           every item at its place now
    rink.sliding                              a slide is under way
    rink.refresh()                            rebuild the shown items (their data changed)
    rink.measure()                            measure the shown items now (forces a layout; size
                                              changes are picked up on their own)
    rink.setHeightScales(map, update = true)  items given part of their height (the rest clipped
                                              away: no layout per frame) and faded:
                                              key -> 0..1 (collapsing / growing them, a frame at a
                                              time); an empty map, all whole again. Keep it to items
                                              near the view: shrunk ones let more items into range
    rink.heightOfKey(key)                     heightOf, by key
    rink.releaseAll()                         drop every item (a subclass's onBeforeRemove calls it)
    rink.itemFor(key)                         the built item while it exists (shown or kept), else undefined
    rink.heightOf(index)                      measured height, else the estimate
    rink.indexAt(y) / rink.offsetOf(index)    track position <-> item
    rink.scrollToIndex(index, center, animate)

Other content (a header) can sit in rink.content before the track; item positions start below it.
With hideOverflow off, items show outside the rink's box: the window, not the box, is the viewport.

************/

class sk_ui_iceRinkVirtual extends sk_ui_iceRink {
    constructor(opt){
        super(opt)

        this.content.compact = true
        this.content.style.left = '0px'
        this.content.style.top = '0px'
        this.content.style.willChange = 'transform'

        this.keyOf = index => index
        this.renderItem = null
        this.renderPlaceholder = null
        this.releaseItem = null
        this.isKept = null
        this.estimateItem = null
        this.onRendered = null
        this.overscan = 600
        this.workBudget = 4
        this.fastScrollSpeed = 1.5      // px/ms: faster than this, placeholders aren't built
        this.slowBuildCost = 8          // ms: items that take longer to build wait until scrolling stops
        this.slideDuration = 500

        this.__count = 0
        this.__keys = []
        this.__heights = new Map()      // key -> measured px
        this.__scales = new Map()       // key -> 0..1: shown at that part of its height (setHeightScales)
        this.__shifts = new Map()       // key -> px: drawn that far from its place (sliding to it)
        this.__raised = new Set()       // keys drawn above the others (while sliding)
        this.__offsets = [0]
        this.__offsetsDirty = true
        this.__estimate = 40
        this.__estimateLearned = false

        // key -> {key, item, element, placeholder, slot, top}; item is null for a placeholder
        this.__shown = new Map()        // in a slot
        this.__kept = new Map()         // built, detached, alive
        this.__releasing = []           // out of the DOM, released in the background
        this.__range = {first: 0, last: -1}
        this.__view = {top: 0, bottom: 0}

        this.track = document.createElement('div')
        this.track.className = 'sk_ui_iceRinkVirtual_track'
        this.content.element.appendChild(this.track)
        this.__freeSlots = []

        // Where the track and the box are: read where layout is fresh (observer callbacks), so
        // working out the viewport never forces a layout.
        this.__geometry = {trackTop: 0, wrapperTop: 0, wrapperHeight: 0}

        // (The scroller reports every frame while the content is shorter than the viewport.)
        var onPositionCalculated = this.scroller.onPositionCalculated
        var lastY
        this.scroller.onPositionCalculated = (x, y) => {
            onPositionCalculated(x, y)
            if (y === lastY) return
            lastY = y
            this.scheduleUpdate()
        }

        // Slots that grow or shrink (an item built, a player opening, a margin): measured before the
        // frame is painted.
        this.__slotObserver = new ResizeObserver(records => {
            this.__readGeometry()
            var list = []
            for (var r of records){
                var entry = this.__shown.get(r.target.__virtualKey)
                if (entry && entry.slot === r.target) list.push(entry)
            }
            this.__measure(list)
        })
        var boxObserver = new ResizeObserver(()=> {
            this.__readGeometry()
            this.scheduleUpdate()
        })
        boxObserver.observe(this.contentWrapper.element)
        boxObserver.observe(this.content.element)
        window.addEventListener('resize', ()=> {
            this.__readGeometry()
            this.scheduleUpdate()
        })
    }

    __readGeometry(){
        var wrapper = this.contentWrapper.element
        this.__geometry = {
            trackTop: this.track.offsetTop,
            wrapperTop: wrapper.getBoundingClientRect().top,
            wrapperHeight: wrapper.clientHeight
        }
    }

    /***** data *****/

    setCount(n, slide){
        // Where the shown items are drawn now (mid-slide too): a slide starts from there.
        var drawn = slide ? this.__drawn() : null

        this.__count = Math.max(0, n | 0)
        this.__offsetsDirty = true
        this.__ensureOffsets()

        // Kept items whose data is gone go for good.
        var live = new Set(this.__keys)
        for (var [key, entry] of Array.from(this.__kept)){
            if (!live.has(key)){
                this.__kept.delete(key)
                this.__queueRelease(entry)
            }
        }
        // Heights of items long gone: dropped once they outnumber the live ones.
        if (this.__heights.size > this.__count * 2 + 100){
            for (var key2 of Array.from(this.__heights.keys())) if (!live.has(key2)) this.__heights.delete(key2)
        }

        this.update()
        if (drawn) this.__slide(drawn, slide)
    }

    get count(){
        return this.__count
    }

    refresh(){
        for (var entry of Array.from(this.__shown.values())) this.__unshow(entry, true)
        this.update()
    }

    itemFor(key){
        var entry = this.__shown.get(key) || this.__kept.get(key)
        return entry ? (entry.item || undefined) : undefined
    }

    get shown(){
        var list = []
        for (var i = this.__range.first; i <= this.__range.last; i++){
            var entry = this.__shown.get(this.__keys[i])
            if (entry && entry.item) list.push({index: i, key: entry.key, item: entry.item})
        }
        return list
    }

    /***** geometry *****/

    // Whole height: measured, else the estimate.
    __baseHeightOf(index){
        var h = this.__heights.get(this.__keys[index])
        if (h !== undefined) return h
        return this.estimateItem ? this.estimateItem(index) : this.__estimate
    }

    // The room it takes: part of it while scaled.
    __heightOf(index){
        var h = this.__baseHeightOf(index)
        var scale = this.__scales.get(this.__keys[index])
        return scale === undefined ? h : h * scale
    }

    heightOf(index){
        this.__ensureOffsets()
        return this.__baseHeightOf(index)
    }

    // By key, for items not (or no longer) in the list: measured, else the learned estimate.
    heightOfKey(key){
        var h = this.__heights.get(key)
        return h === undefined ? this.__estimate : h
    }

    setHeightScales(scales, update = true){
        this.__scales = scales
        this.__offsetsDirty = true
        if (update) this.update()
    }

    /***** sliding to new places *****/

    get sliding(){
        return !!this.__slideAnim
    }

    // The shown items' drawn tops (a slide's shift included) and elements, by key.
    __drawn(){
        var drawn = new Map()
        for (var entry of this.__shown.values()){
            if (entry.top !== undefined) drawn.set(entry.key, {top: entry.top, element: entry.element})
        }
        return drawn
    }

    // Each item drawn before starts where it was and closes the distance, eased in and out; one
    // drawn before and gone from the list fades out where it was (a copy: the item itself is
    // released). Only slot transforms are written per frame.
    __slide(drawn, opt){
        this.endSlide()
        var keys = this.__keys
        var offsets = this.__offsets
        var shifts = new Map()
        for (var i = 0; i < this.__count; i++){
            var was = drawn.get(keys[i])
            if (!was) continue
            drawn.delete(keys[i])
            if (was.top !== offsets[i]) shifts.set(keys[i], was.top - offsets[i])
        }
        var ghosts = []
        for (var gone of drawn.values()){
            var ghost = document.createElement('div')
            ghost.className = 'sk_ui_iceRinkVirtual_slot'
            ghost.style.transform = 'translateY(' + gone.top + 'px)'
            ghost.style.pointerEvents = 'none'
            ghost.appendChild(gone.element.cloneNode(true))
            this.track.appendChild(ghost)
            ghosts.push(ghost)
        }

        var anim = this.__slideAnim = {start: performance.now(), shifts: shifts, ghosts: ghosts, onEnd: opt.onEnd, frame: 0}
        this.__raised = opt.raised || new Set()
        var step = ()=> {
            if (this.__slideAnim !== anim) return
            var p = (performance.now() - anim.start) / this.slideDuration
            if (p >= 1) return this.endSlide()
            var left = p < 0.5 ? 1 - 4 * p * p * p : Math.pow(-2 * p + 2, 3) / 2
            var now = new Map()
            shifts.forEach((px, key) => now.set(key, px * left))
            this.__shifts = now
            for (var g of ghosts) g.style.opacity = String(Math.round(left * 1000) / 1000)
            this.__position()
            anim.frame = requestAnimationFrame(step)
        }
        step()
    }

    endSlide(){
        var anim = this.__slideAnim
        if (!anim) return
        this.__slideAnim = null
        cancelAnimationFrame(anim.frame)
        for (var g of anim.ghosts) g.remove()
        this.__shifts = new Map()
        this.__raised = new Set()
        this.__ensureOffsets()
        this.__position()
        if (anim.onEnd) anim.onEnd()
    }

    __ensureOffsets(){
        if (!this.__offsetsDirty) return
        var n = this.__count
        var keys = this.__keys
        keys.length = n
        for (var i = 0; i < n; i++) keys[i] = this.keyOf(i)

        var offsets = this.__offsets
        offsets.length = n + 1
        offsets[0] = 0
        for (var j = 0; j < n; j++) offsets[j + 1] = offsets[j] + this.__heightOf(j)
        this.__offsetsDirty = false
        this.track.style.height = offsets[n] + 'px'
    }

    offsetOf(index){
        this.__ensureOffsets()
        return this.__offsets[Math.max(0, Math.min(this.__count, index))]
    }

    get totalHeight(){
        this.__ensureOffsets()
        return this.__offsets[this.__count]
    }

    // Item whose span holds track position y (clamped to the list).
    indexAt(y){
        this.__ensureOffsets()
        var offsets = this.__offsets
        var lo = 0
        var hi = this.__count - 1
        var found = 0
        while (lo <= hi){
            var mid = (lo + hi) >> 1
            if (offsets[mid] <= y){
                found = mid
                lo = mid + 1
            } else hi = mid - 1
        }
        return found
    }

    // The part of the track that can be seen, in track px.
    __viewport(){
        var g = this.__geometry
        var top = 0 - this.scrollPos.y - g.trackTop
        var height = g.wrapperHeight
        if (!this.hideOverflow){
            top -= g.wrapperTop
            height = window.innerHeight
        }
        return {top: top, bottom: top + height}
    }

    scrollToIndex(index, center = false, animate = true){
        if (!this.__count) return
        index = Math.max(0, Math.min(this.__count - 1, index | 0))
        var y = this.offsetOf(index) + this.__geometry.trackTop
        if (center) y -= (this.__geometry.wrapperHeight - this.__heightOf(index)) / 2
        this.scrollTo(null, 0 - y, animate)
    }

    /***** rendering *****/

    scheduleUpdate(){
        if (this.__frame) return
        this.__frame = requestAnimationFrame(()=> {
            this.__frame = 0
            this.update()
        })
    }

    update(){
        if (!this.renderItem || !this.element.isConnected) return
        if (!this.__geometry.wrapperHeight) this.__readGeometry()
        this.__ensureOffsets()

        var view = this.__viewport()
        this.__view = view
        var n = this.__count
        var first = n ? this.indexAt(Math.max(0, view.top - this.overscan)) : 0
        var last = n ? this.indexAt(Math.max(0, view.bottom + this.overscan)) : -1

        var wanted = new Set()
        for (var i = first; i <= last; i++) wanted.add(this.__keys[i])

        for (var entry of Array.from(this.__shown.values())){
            if (!wanted.has(entry.key)) this.__unshow(entry)
        }

        var builtAdded = false
        for (var k = first; k <= last; k++){
            var key = this.__keys[k]
            if (this.__shown.has(key)) continue
            var shown = this.__kept.get(key)
            if (shown){
                this.__kept.delete(key)
                this.__place(shown, this.__acquireSlot())
            } else {
                shown = this.__create(k, key)
                if (!shown) continue
            }
            this.__shown.set(key, shown)
            if (shown.item) builtAdded = true
        }

        var rangeMoved = first !== this.__range.first || last !== this.__range.last
        this.__range = {first: first, last: last}
        this.__position()

        if ((builtAdded || rangeMoved) && this.onRendered) this.onRendered(this.shown)
        this.__scheduleWork()
    }

    // Shown slots at their items' offsets (sliding ones shifted from there), scaled ones clipped to
    // their part (only what changed is written).
    __position(){
        for (var i = this.__range.first; i <= this.__range.last; i++){
            var entry = this.__shown.get(this.__keys[i])
            if (!entry) continue
            var top = this.__offsets[i] + (this.__shifts.get(entry.key) || 0)
            if (entry.top !== top){
                entry.top = top
                entry.slot.style.transform = 'translateY(' + top + 'px)'
            }
            var raised = this.__raised.has(entry.key)
            if (!!entry.raised !== raised){
                entry.raised = raised
                entry.slot.style.zIndex = raised ? '1' : ''
            }
            // A scaled one keeps its height, its lower part clipped away (the ones after it are
            // placed by the scaled height): no layout, nothing measured, each frame. It fades with its
            // part too, on its own layer meanwhile.
            var scale = this.__scales.get(entry.key)
            var clip = scale === undefined ? '' : 'inset(0px 0px ' + Math.max(0, this.__baseHeightOf(i) - this.__heightOf(i)) + 'px 0px)'
            if (entry.clip !== clip){
                var style = entry.slot.style
                if (!entry.clip !== !clip) style.willChange = clip ? 'transform, opacity, clip-path' : ''
                entry.clip = clip
                style.clipPath = clip
                style.opacity = scale === undefined ? '' : String(Math.round(scale * 1000) / 1000)
            }
        }
    }

    __acquireSlot(){
        var slot = this.__freeSlots.pop()
        if (!slot){
            slot = document.createElement('div')
            slot.className = 'sk_ui_iceRinkVirtual_slot'
            this.track.appendChild(slot)
        }
        slot.style.display = ''
        return slot
    }

    __freeSlot(slot){
        this.__slotObserver.unobserve(slot)
        slot.style.display = 'none'
        slot.__virtualKey = undefined
        this.__freeSlots.push(slot)
    }

    // An entry's element into a slot; the observer then measures it.
    __place(entry, slot){
        if (entry.element.parentNode !== slot) slot.appendChild(entry.element)
        entry.slot = slot
        entry.top = undefined
        entry.clip = undefined          // (a reused slot may still be clipped or raised for its last item)
        entry.raised = undefined
        slot.style.clipPath = slot.style.opacity = slot.style.willChange = slot.style.zIndex = ''
        slot.__virtualKey = entry.key
        this.__slotObserver.observe(slot)
    }

    __create(index, key){
        var slot = this.__acquireSlot()
        if (this.renderPlaceholder){
            var el = this.renderPlaceholder(index)
            if (el){
                var entry = {key: key, item: null, element: el, placeholder: true}
                this.__place(entry, slot)
                return entry
            }
        }
        var real = this.__build(index, key, slot)
        if (!real){
            this.__freeSlot(slot)
            return null
        }
        this.__place(real, slot)
        return real
    }

    // renderItem builds with rink.content.add, which appends to rink.content's element: pointed at
    // the slot meanwhile, so the item is born in its slot and the content's children never change.
    __build(index, key, slot){
        var contentElement = this.content.element
        this.content.element = slot
        try {
            var item = this.renderItem(index)
        } finally {
            this.content.element = contentElement
        }
        if (!item) return null
        return {key: key, item: item, element: item.element || item, placeholder: false}
    }

    __unshow(entry, forceRelease){
        this.__shown.delete(entry.key)
        entry.element.remove()
        this.__freeSlot(entry.slot)
        entry.slot = null
        if (entry.placeholder) return
        if (!forceRelease && this.isKept && this.isKept(entry.key)){
            this.__kept.set(entry.key, entry)
            return
        }
        this.__queueRelease(entry)
    }

    /***** background work: building placeholders' items, releasing items that left *****/

    __queueRelease(entry){
        this.__releasing.push(entry)
        this.__scheduleWork()
    }

    __release(entry){
        if (this.releaseItem) return this.releaseItem(entry.item, entry.key)
        if (entry.item.element) entry.item.remove()
        else entry.element.remove()
    }

    __scheduleWork(){
        if (this.__workFrame) return
        var pending = this.__releasing.length
        if (!pending) for (var entry of this.__shown.values()) if (entry.placeholder){ pending = 1; break }
        if (!pending) return
        this.__workFrame = requestAnimationFrame(()=> {
            this.__workFrame = 0
            this.__work()
        })
    }

    // Scroll speed in px/ms, sampled once per work frame.
    // Scroll speed in px/ms, sampled once per work frame and smoothed (one frame's reading jitters
    // with when the scroll and the work ran in it); falls to ~0 within a few frames of stopping.
    __sampleSpeed(now){
        var y = this.scrollPos.y
        var last = this.__speedSample
        this.__speedSample = {y: y, t: now}
        var raw = (!last || now <= last.t) ? 0 : Math.abs(y - last.y) / (now - last.t)
        this.__speed = (this.__speed || 0) * 0.6 + raw * 0.4
        return this.__speed
    }

    // Placeholders in view become items first, then the ones in the overscan; then releases.
    // Scrolling fast, nothing is built (an item would be gone before it was seen); scrolling, only
    // items in view, and only if an item builds within the budget (on a slow computer it doesn't:
    // building would stall the scroll, so items are built once it stops); still, the overscan too.
    __work(){
        if (!this.element.isConnected) return
        var start = performance.now()
        var budget = this.workBudget
        var view = this.__view
        var offsets = this.__offsets
        var speed = this.__sampleSpeed(start)
        var stopped = speed < 0.05
        var slowBuilds = this.__buildCost > this.slowBuildCost
        var building = stopped || (speed < this.fastScrollSpeed && !slowBuilds)
        var buildNearby = stopped

        var inView = []
        var nearby = []
        for (var i = this.__range.first; i <= this.__range.last; i++){
            var entry = this.__shown.get(this.__keys[i])
            if (!entry || !entry.placeholder) continue
            var top = offsets[i]
            var visible = top < view.bottom && top + this.__heightOf(i) > view.top
            ;(visible ? inView : nearby).push(i)
        }

        // Releasing gets its share of the budget even while building.
        var buildBudget = this.__releasing.length ? budget / 2 : budget
        var built = 0
        var lists = !building ? [] : (buildNearby ? [inView, nearby] : [inView])
        for (var list of lists){
            for (var j = 0; j < list.length; j++){
                if (built && performance.now() - start > buildBudget) break
                var index = list[j]
                var placeholder = this.__shown.get(this.__keys[index])
                var slot = placeholder.slot
                var buildStart = performance.now()
                var real = this.__build(index, placeholder.key, slot)
                if (!real) continue
                var cost = performance.now() - buildStart
                this.__buildCost = (this.__buildCost === undefined ? cost : this.__buildCost * 0.7 + cost * 0.3)
                placeholder.element.remove()
                real.top = placeholder.top
                real.clip = placeholder.clip
                real.raised = placeholder.raised
                real.slot = slot
                this.__shown.set(real.key, real)
                // (Observed again: the observer reports a slot when observing starts, so the new
                // item is measured even if it came out exactly the placeholder's height.)
                this.__slotObserver.unobserve(slot)
                this.__slotObserver.observe(slot)
                built++
            }
        }

        // Still, at least one goes per frame; scrolling, only within what is left of the budget.
        var released = 0
        while (this.__releasing.length && ((stopped && !released) || performance.now() - start < budget)){
            this.__release(this.__releasing.shift())
            released++
        }

        if (built && this.onRendered) this.onRendered(this.shown)
        this.__scheduleWork()
    }

    /***** measuring *****/

    measure(){
        this.__measure(Array.from(this.__shown.values()))
    }

    // Real heights (a slot holds its item's margins too). Items above the viewport that came out
    // taller or shorter than counted move the scroll position by the difference.
    __measure(entries){
        if (!entries.length) return
        var view = this.__view
        var shift = 0
        var changed = false
        var learned = []
        var indexOfKey = new Map()
        for (var i = this.__range.first; i <= this.__range.last; i++) indexOfKey.set(this.__keys[i], i)

        for (var entry of entries){
            // (Placeholders are sized from heightOf: nothing to learn from them.)
            if (entry.placeholder || !entry.slot) continue
            var index = indexOfKey.get(entry.key)
            if (index === undefined) continue
            // (A scaled one keeps its whole height, only clipped.)
            var scale = this.__scales.get(entry.key)
            var h = entry.slot.offsetHeight
            if (!this.isKept || !this.isKept(entry.key)) learned.push(h)

            var before = this.__baseHeightOf(index)
            if (h === before) continue
            changed = true
            if (this.__offsets[index] + this.__heightOf(index) <= view.top) shift += (h - before) * (scale === undefined ? 1 : scale)
            this.__heights.set(entry.key, h)
        }

        // The estimate is learned once, from the first items shown: changing it later would move
        // everything counted by estimate.
        if (!this.__estimateLearned && learned.length){
            this.__estimateLearned = true
            learned.sort((a, b) => a - b)
            var median = learned[learned.length >> 1]
            if (median !== this.__estimate){
                this.__estimate = median
                changed = true
            }
        }

        if (!changed) return
        this.__offsetsDirty = true
        this.__ensureOffsets()
        this.__position()
        if (shift) this.__shiftScroll(shift)
        // Measured heights can change which items are in range.
        this.scheduleUpdate()
    }

    // Moves the scroll position by px without a visible jump, mid-drag, mid-inertia or mid-tween.
    __shiftScroll(px){
        var scroller = this.scroller
        var tween = scroller.tweenY
        tween.current -= px
        if (tween.last !== undefined) tween.last -= px
        if (tween.target !== undefined) tween.target -= px
        if (scroller.dragging && scroller.startOffsetY !== undefined) scroller.startOffsetY -= px
        scroller.onPositionCalculated(scroller.tweenX.current, tween.current)
        this.positionContent(this.scrollPos.x, this.scrollPos.y)
    }

    // By transform, on its own layer: scrolling moves the painted list instead of laying the page
    // out and repainting the list every frame.
    positionContent(x, y){
        if (x === this.__contentX && y === this.__contentY) return
        this.__contentX = x
        this.__contentY = y
        this.content.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)'
    }

    async onBeforeRemove(){
        this.releaseAll()
    }

    releaseAll(){
        if (this.__frame) cancelAnimationFrame(this.__frame)
        if (this.__workFrame) cancelAnimationFrame(this.__workFrame)
        this.__frame = this.__workFrame = 0
        if (this.__slideAnim){
            cancelAnimationFrame(this.__slideAnim.frame)
            this.__slideAnim.ghosts.forEach(g => g.remove())
            this.__slideAnim = null
        }
        this.__slotObserver.disconnect()
        for (var entry of this.__shown.values()){
            entry.element.remove()
            if (!entry.placeholder) this.__release(entry)
        }
        for (var entry2 of this.__kept.values()) this.__release(entry2)
        for (var entry3 of this.__releasing) this.__release(entry3)
        this.__shown.clear()
        this.__kept.clear()
        this.__releasing = []
    }
}
