/************

sk_ui_virtualList — a natively scrolling list that keeps only the rows near the viewport in
the DOM, for lists too long to render whole (a transcript of thousands of segments).

Rows can be any height. A row is estimated (estimateRow, else rowEstimate) until it has been
rendered, then measured; when a measured height moves rows above the viewport, the scroll
position is corrected so what is on screen stays put. A width change re-measures.

    list.renderRow = index => HTMLElement     build row `index` (plain DOM keeps it cheap)
    list.onRowRemoved = (index, el) => {}     a row left the DOM (scrolled away / refresh)
    list.estimateRow = index => px            optional height guess for unrendered rows
    list.gap = px                             space between rows
    list.setCount(n)                          row count (keeps measured heights of rows kept)
    list.refresh()                            rebuild the rendered rows (data changed)
    list.offsetOf(index) / list.indexAt(y)    content position ↔ row
    list.scrollToIndex(index, {align, offset, behavior})   'start' | 'center' | 'third' | 'nearest';
                                              'smooth' is one eased scroll, however far (below)
    list.rowElement(index)                    the row's element when rendered, else null
    list.content                              the element rows sit in (position: relative)

(sk_ui_infinite_list is for fixed-height rows fetched asynchronously, on a custom scroller.)

************/

class sk_ui_virtualList extends sk_ui_component {
    constructor(opt){
        super(opt)
        this.style.overflow = 'auto'
        this.style.position = 'relative'
        this.style.minHeight = '0'

        this.content = document.createElement('div')
        this.content.className = 'sk_ui_virtualList_content'
        this.element.appendChild(this.content)

        this.renderRow = null
        this.onRowRemoved = null
        this.estimateRow = null
        this.rowEstimate = 40
        this.gap = 0
        // Rendered beyond the viewport, in px, each side.
        this.overscan = 600

        this.count = 0
        this.heights = []
        this.offsets = [0]
        this._offsetsDirty = true
        this.rows = new Map()

        this.element.addEventListener('scroll', ()=> this.scheduleUpdate())
        // The user takes over: an animated scroll stops.
        for (var type of ['wheel', 'touchstart', 'mousedown', 'keydown']) {
            this.element.addEventListener(type, ()=> this.stopAnimation(), {passive: true})
        }
        this._width = 0
        if (typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(()=> {
                var width = this.element.clientWidth
                if (width === this._width) {
                    this.scheduleUpdate()
                    return
                }
                this._width = width
                this.remeasure()
            })
            this._resizeObserver.observe(this.element)
        }
    }

    // sk_ui_component calls it after the element is removed.
    onRemove(){
        if (this._resizeObserver) this._resizeObserver.disconnect()
        if (this._frame) cancelAnimationFrame(this._frame)
        this.stopAnimation()
    }

    setCount(n){
        n = Math.max(0, n | 0)
        if (n < this.count) {
            for (var [index, el] of Array.from(this.rows)) if (index >= n) this.removeRow(index, el)
            this.heights.length = n
        }
        this.count = n
        this._offsetsDirty = true
        this.update()
    }

    // Data behind the rows changed: rebuild the rendered ones (their heights are re-measured).
    refresh(){
        for (var [index, el] of Array.from(this.rows)) this.removeRow(index, el)
        this.update()
    }

    // Width changed: measured heights no longer hold. Keeps the first visible row where it was.
    remeasure(){
        var anchor = this.anchor()
        for (var i = 0; i < this.heights.length; i++) this.heights[i] = undefined
        this._offsetsDirty = true
        this.refresh()
        this.restoreAnchor(anchor)
    }

    rowHeight(index){
        var h = this.heights[index]
        if (h !== undefined) return h
        return this.estimateRow ? this.estimateRow(index) : this.rowEstimate
    }

    ensureOffsets(){
        if (!this._offsetsDirty) return
        var offsets = this.offsets
        offsets.length = this.count + 1
        offsets[0] = 0
        for (var i = 0; i < this.count; i++) offsets[i + 1] = offsets[i] + this.rowHeight(i) + (i < this.count - 1 ? this.gap : 0)
        this._offsetsDirty = false
        this.content.style.height = offsets[this.count] + 'px'
    }

    offsetOf(index){
        this.ensureOffsets()
        return this.offsets[Math.max(0, Math.min(this.count, index))]
    }

    get totalHeight(){
        this.ensureOffsets()
        return this.offsets[this.count]
    }

    // Row whose span contains content position y (clamped to the list).
    indexAt(y){
        this.ensureOffsets()
        var offsets = this.offsets
        var lo = 0
        var hi = this.count - 1
        var found = 0
        while (lo <= hi) {
            var mid = (lo + hi) >> 1
            if (offsets[mid] <= y) {
                found = mid
                lo = mid + 1
            } else hi = mid - 1
        }
        return found
    }

    rowElement(index){
        return this.rows.get(index) || null
    }

    removeRow(index, el){
        this.rows.delete(index)
        el.remove()
        if (this.onRowRemoved) this.onRowRemoved(index, el)
    }

    anchor(){
        if (!this.count) return null
        var top = this.element.scrollTop
        var index = this.indexAt(top)
        return {index: index, delta: top - this.offsetOf(index)}
    }

    restoreAnchor(anchor){
        if (!anchor) return
        this.element.scrollTop = this.offsetOf(anchor.index) + anchor.delta
        this.update()
    }

    scheduleUpdate(){
        if (this._frame) return
        this._frame = requestAnimationFrame(()=> {
            this._frame = 0
            this.update()
        })
    }

    // Renders the rows near the viewport, drops the rest, measures what was just rendered.
    update(){
        if (!this.renderRow) return
        this.ensureOffsets()
        var el = this.element
        var viewTop = el.scrollTop
        var viewHeight = el.clientHeight || 0
        var first = this.count ? this.indexAt(Math.max(0, viewTop - this.overscan)) : 0
        var last = this.count ? this.indexAt(viewTop + viewHeight + this.overscan) : -1
        for (var [index, rowEl] of Array.from(this.rows)) {
            if (index < first || index > last) this.removeRow(index, rowEl)
        }
        var added = []
        for (var i = first; i <= last; i++) {
            if (this.rows.has(i)) continue
            var row = this.renderRow(i)
            if (!row) continue
            row.style.position = 'absolute'
            row.style.left = '0'
            row.style.right = '0'
            row.style.top = this.offsets[i] + 'px'
            this.rows.set(i, row)
            this.content.appendChild(row)
            added.push(i)
        }
        if (!added.length) return
        // Measure the new rows (one layout for the batch); rows above the viewport that grew or
        // shrank shift the scroll position by the same amount, so the view does not jump.
        var shiftAbove = 0
        var changed = false
        for (var k = 0; k < added.length; k++) {
            var index2 = added[k]
            var h = this.rows.get(index2).offsetHeight
            var before = this.rowHeight(index2)
            if (h !== before) {
                changed = true
                if (this.offsets[index2] < viewTop) shiftAbove += h - before
            }
            this.heights[index2] = h
        }
        if (!changed) return
        this._offsetsDirty = true
        this.ensureOffsets()
        for (var [index3, rowEl3] of this.rows) rowEl3.style.top = this.offsets[index3] + 'px'
        // (An animated scroll sets the position itself every frame, from the new offsets.)
        if (shiftAbove && !this._animation) el.scrollTop = viewTop + shiftAbove
        // Estimates were off: the rows now in range may differ; one more pass settles it.
        this.scheduleUpdate()
    }

    // Scroll position that shows row `index` as asked (from the current offsets).
    // align: 'start' (row at the top), 'center', 'third' (upper third), 'nearest' (only if out
    // of sight; null when it is in sight). offset: px into the row (a word inside it).
    scrollTargetFor(index, opt = {}){
        var el = this.element
        var top = this.offsetOf(index) + (opt.offset || 0)
        var height = opt.offset ? 0 : this.rowHeight(index)
        var view = el.clientHeight || 0
        var align = opt.align || 'start'
        var target = top
        if (align === 'center') target = top + height / 2 - view / 2
        else if (align === 'third') target = top - view / 3
        else if (align === 'nearest') {
            if (top >= el.scrollTop && top + height <= el.scrollTop + view) return null
            target = top < el.scrollTop ? top : top + height - view
        }
        return Math.max(0, Math.min(this.totalHeight - view, target))
    }

    // behavior 'smooth': one eased scroll, however far. Rows are drawn and measured on the way,
    // which moves the destination; each frame aims at its latest position instead of starting a
    // new scroll (the browser's smooth scroll stopped and restarted as rows were measured).
    scrollToIndex(index, opt = {}){
        if (!this.count) return
        index = Math.max(0, Math.min(this.count - 1, index | 0))
        var target = this.scrollTargetFor(index, opt)
        if (target === null) return
        this.stopAnimation()
        if (opt.behavior !== 'smooth') {
            this.element.scrollTop = target
            this.update()
            return
        }
        var from = this.element.scrollTop
        var distance = Math.abs(target - from)
        if (distance < 1) return
        this._animation = {
            index: index,
            opt: Object.assign({}, opt, {align: opt.align === 'nearest' ? 'start' : opt.align}),
            from: from,
            startedAt: performance.now(),
            duration: Math.min(700, 250 + Math.sqrt(distance) * 3)
        }
        this._animationFrame = requestAnimationFrame(()=> this.stepAnimation())
    }

    get animating(){
        return !!this._animation
    }

    // Row an animated scroll is heading to (undefined when not animating).
    get animatingTo(){
        return this._animation ? this._animation.index : undefined
    }

    stepAnimation(){
        var anim = this._animation
        if (!anim) return
        var t = Math.min(1, (performance.now() - anim.startedAt) / anim.duration)
        var eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        var target = this.scrollTargetFor(anim.index, anim.opt)
        this.element.scrollTop = anim.from + (target - anim.from) * eased
        this.update()
        if (t < 1) {
            this._animationFrame = requestAnimationFrame(()=> this.stepAnimation())
            return
        }
        this._animation = null
        // Rows drawn at the destination may have moved it once more.
        this.element.scrollTop = this.scrollTargetFor(anim.index, anim.opt)
        this.update()
    }

    stopAnimation(){
        if (this._animationFrame) cancelAnimationFrame(this._animationFrame)
        this._animationFrame = 0
        this._animation = null
    }
}
