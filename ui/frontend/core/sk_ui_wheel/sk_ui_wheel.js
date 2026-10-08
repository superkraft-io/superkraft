/**
 * Thumbwheel: a ridged cylinder seen edge-on that you spin to change a value.
 *
 * Each notch is one `step`. Turn it by dragging along its axis, by scrolling along its axis
 * (mouse wheel or trackpad; scrolling across it is ignored), or with the arrow keys when focused. Hold Shift for finer turning; fast flicks
 * go further. Up (vertical) or right (horizontal) increases.
 *
 * Two modes:
 * - Relative (default, no min / max): `value` is the total since the gesture started, and it
 *   springs back to 0 when the gesture ends. For nudges such as "grow by".
 * - Bounded (both `min` and `max` set): `value` is kept between them and stays where it is.
 *   Double-click resets it to `defaultValue`.
 *
 * Feel (all off by default, so existing wheels behave as before):
 * - smooth: the value follows the turn continuously instead of jumping a whole step per notch.
 * - springyEdges: a bounded wheel stretches a little past min / max with growing resistance and
 *   springs back on release. The value itself never leaves the bounds.
 * - detents: the wheel resists leaving a step, snaps through once pushed far enough, and settles
 *   onto the nearest step on release.
 * - momentum: a drag released while moving keeps turning and slows down (smooth or detented).
 * - reversed: left (horizontal) or down (vertical) increases instead. The ridges still follow
 *   the pointer / fingers, like pulling a ruler: swipe or drag left and higher values come in.
 *
 * Callbacks: onChangedStart(value), onChanged(value, delta), onChangedEnd(value).
 * onChangedEnd fires after any settle / momentum has finished.
 * Colors come from CSS variables on the element (see sk_ui_wheel.css).
 */
class sk_ui_wheel extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.classAdd('sk_ui_wheel sk_ui_wheel_vertical')
        this.animate = false
        this.pluginParamType = 'draggable'
        this.ownerHandlesDragAction = true

        this.__vertical = true
        this.__step = 1
        this.__notchPx = 6
        this.__value = 0
        this.__defaultValue = 0

        // Turned angle in notches (fractional while dragging), drives the drawing only.
        this.__turn = 0
        this.__gesture = null

        this.canvas = document.createElement('canvas')
        this.canvas.className = 'sk_ui_wheel_canvas'
        this.element.appendChild(this.canvas)
        this.element.tabIndex = 0

        this.attributes.add({friendlyName: 'Vertical', name: 'vertical', type: 'bool', onSet: val => {
            this.__vertical = val !== false
            this.classRemove('sk_ui_wheel_vertical sk_ui_wheel_horizontal')
            this.classAdd(this.__vertical ? 'sk_ui_wheel_vertical' : 'sk_ui_wheel_horizontal')
            this.draw()
        }, onGet: ()=> this.__vertical})
        this.attributes.add({friendlyName: 'Step', name: 'step', type: 'number', onSet: val => {
            var step = Number(val)
            this.__step = Number.isFinite(step) && step > 0 ? step : 1
        }, onGet: ()=> this.__step})
        this.attributes.add({friendlyName: 'Pixels per notch', name: 'notchPx', type: 'number', onSet: val => {
            var px = Number(val)
            this.__notchPx = Number.isFinite(px) && px > 0 ? px : 6
        }, onGet: ()=> this.__notchPx})
        this.__smooth = false
        this.__springyEdges = false
        this.__detents = false
        this.__momentum = false
        this.__reversed = false
        this.attributes.add({friendlyName: 'Reversed', name: 'reversed', type: 'bool', onSet: val => { this.__reversed = !!val; this.draw() }, onGet: ()=> this.__reversed})
        this.attributes.add({friendlyName: 'Smooth', name: 'smooth', type: 'bool', onSet: val => { this.__smooth = !!val }, onGet: ()=> this.__smooth})
        this.attributes.add({friendlyName: 'Springy edges', name: 'springyEdges', type: 'bool', onSet: val => { this.__springyEdges = !!val }, onGet: ()=> this.__springyEdges})
        this.attributes.add({friendlyName: 'Detents', name: 'detents', type: 'bool', onSet: val => { this.__detents = !!val }, onGet: ()=> this.__detents})
        this.attributes.add({friendlyName: 'Momentum', name: 'momentum', type: 'bool', onSet: val => { this.__momentum = !!val }, onGet: ()=> this.__momentum})
        this.attributes.add({friendlyName: 'Min', name: 'min', type: 'number'})
        this.attributes.add({friendlyName: 'Max', name: 'max', type: 'number'})
        this.attributes.add({friendlyName: 'Default Value', name: 'defaultValue', type: 'number', onSet: val => {
            var value = Number(val)
            this.__defaultValue = Number.isFinite(value) ? value : 0
        }, onGet: ()=> this.__defaultValue})
        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'number', onSet: val => {
            var value = Number(val)
            this.__value = this.clamp(Number.isFinite(value) ? value : 0)
            this.draw()
        }, onGet: ()=> this.__value})

        this.setupPointer()
        this.setupWheel()
        this.setupKeys()

        this.element.addEventListener('dblclick', event => {
            if (!this.isBounded()) return
            event.preventDefault()
            event.stopPropagation()
            this.beginGesture('reset')
            this.applyValue(this.__defaultValue)
            this.endGesture()
        })

        if (typeof ResizeObserver !== 'undefined') {
            this.__resizeObserver = new ResizeObserver(()=> this.draw())
            this.__resizeObserver.observe(this.element)
        }
        requestAnimationFrame(()=> this.draw())
    }

    // —— Value ——————————————————————————————————————————————————

    isBounded(){
        return Number.isFinite(Number(this.min)) && Number.isFinite(Number(this.max))
    }

    clamp(value){
        if (!this.isBounded()) return value
        var lo = Math.min(Number(this.min), Number(this.max))
        var hi = Math.max(Number(this.min), Number(this.max))
        return Math.max(lo, Math.min(hi, value))
    }

    // Rounds away float drift from repeated steps (0.1 + 0.2 …).
    snap(value){
        var digits = Math.min(10, Math.max(0, -Math.floor(Math.log10(this.__step)) + 2))
        return Number(value.toFixed(digits))
    }

    // smooth / detents / springy / momentum go through the "feel" path; plain wheels keep the
    // original whole-notch path untouched.
    usesFeel(){
        return this.__smooth || this.__detents || this.__springyEdges || this.__momentum
    }

    beginGesture(kind){
        // A new touch while settling or coasting lands the old motion first.
        if (this.__settle) this.finishSettle()
        if (this.__gesture) {
            if (this.__gesture.kind === kind) return
            // Another kind of turn is still open (e.g. a scroll burst when a drag starts):
            // finish it first, so the new one is never ignored.
            this.endGesture()
        }
        this.__gesture = {kind: kind, startValue: this.isBounded() ? this.__value : 0, notches: 0, carry: 0, raw: 0, turnBase: this.__turn}
        if (!this.isBounded()) this.__value = 0
        this.classAdd('sk_ui_wheel_active')
        if (this.onChangedStart) this.onChangedStart(this.__value)
    }

    // Turn by a number of notches (may be fractional; whole notches change the value).
    turn(notches){
        var gesture = this.__gesture
        if (!gesture || !notches) return
        if (this.usesFeel()) return this.turnFeel(notches)
        gesture.carry += notches
        var whole = gesture.carry > 0 ? Math.floor(gesture.carry) : Math.ceil(gesture.carry)
        var before = this.__value
        if (whole) {
            gesture.carry -= whole
            gesture.notches += whole
            this.applyValue(gesture.startValue + gesture.notches * this.__step)
        }
        // A bounded wheel stops turning at its end stops.
        var stopped = this.isBounded() && whole && this.__value === before
        if (!stopped) this.__turn += notches
        this.draw()
    }

    applyValue(value){
        var next = this.snap(this.clamp(value))
        var delta = next - this.__value
        if (!delta) return
        this.__value = next
        if (this.__dawPluginWriteParamValue) this.__dawPluginWriteParamValue(next)
        if (this.onChanged) this.onChanged(next, delta)
    }

    // —— Feel path (smooth / springy edges / detents / momentum) ——————————————

    bounds(){
        var lo = Math.min(Number(this.min), Number(this.max))
        var hi = Math.max(Number(this.min), Number(this.max))
        return {lo: lo, hi: hi}
    }

    // Steps sit on a fixed grid (from min when bounded), not relative to where a gesture began.
    gridOrigin(){
        return this.isBounded() ? this.bounds().lo : 0
    }

    // Sticky steps: flat near each step, steep halfway between, so it resists then snaps through.
    detentCurve(u){
        var n = Math.floor(u)
        var f = u - n
        var p = 3
        return n + (f < 0.5 ? 0.5 * Math.pow(2 * f, p) : 1 - 0.5 * Math.pow(2 * (1 - f), p))
    }

    // Overshoot past an end, in notches, shrunk with growing resistance (at most ~1.2 notches).
    rubber(over){
        var c = 1.2
        return Math.sign(over) * c * (1 - 1 / (1 + Math.abs(over) / c))
    }

    turnFeel(notches){
        var g = this.__gesture
        var step = this.__step
        g.raw += notches
        var bounded = this.isBounded()
        var rawLo = -Infinity
        var rawHi = Infinity
        if (bounded) {
            var b = this.bounds()
            rawLo = (b.lo - g.startValue) / step
            rawHi = (b.hi - g.startValue) / step
            // Without springy edges the turn stops dead at the bound; with them a little is allowed.
            var slack = this.__springyEdges ? 6 : 0
            g.raw = Math.max(rawLo - slack, Math.min(rawHi + slack, g.raw))
            g.atEdge = g.raw <= rawLo || g.raw >= rawHi
        }
        var inside = Math.max(rawLo, Math.min(rawHi, g.raw))
        var over = g.raw - inside
        var origin = this.gridOrigin()
        var u = (g.startValue + inside * step - origin) / step
        if (this.__detents) u = this.detentCurve(u)
        var value = origin + (this.__smooth ? u : Math.round(u)) * step
        this.__turn = g.turnBase + (origin + u * step - g.startValue) / step + this.rubber(over)
        this.applyValue(value)
        this.draw()
    }

    // The value the drawing shows: follows the turn (including a springy overshoot) mid-gesture.
    visualValue(){
        var g = this.__gesture || (this.__settle && this.__settle.gesture)
        if (g && this.usesFeel()) return g.startValue + (this.__turn - g.turnBase) * this.__step
        return this.__value
    }

    // Where a released wheel comes to rest: back inside the bounds, and onto a step with detents.
    settleTarget(){
        var value = this.__value
        if (this.__detents) {
            var origin = this.gridOrigin()
            value = origin + Math.round((value - origin) / this.__step) * this.__step
        }
        return this.snap(this.clamp(value))
    }

    // Release spring, same feel as sk_ui_sxa_knob's: underdamped (stiffness 800, damping 10,
    // mass 0.2), so the ridges overshoot and ring a little before resting. The value goes straight
    // to where it ends up (the bound, or the nearest detent); only the drawing bounces.
    startSettle(gesture, velocity){
        var target = this.settleTarget()
        var turnTarget = gesture.turnBase + (target - gesture.startValue) / this.__step
        this.applyValue(target)
        if (Math.abs(this.__turn - turnTarget) < 1e-3 && !velocity) return false
        var state = {gesture: gesture, target: target, turnTarget: turnTarget, velocity: velocity || 0, last: performance.now()}
        this.__settle = state
        var spring = {stiffness: 800, damping: 10, mass: 0.2}
        var tick = now => {
            if (this.__settle !== state) return
            var dt = Math.min(0.032, Math.max(0.001, (now - state.last) / 1000))
            state.last = now
            var steps = Math.max(1, Math.ceil(dt / 0.008))
            var h = dt / steps
            for (var i = 0; i < steps; i++) {
                var x = this.__turn - state.turnTarget
                state.velocity += ((-spring.stiffness * x - spring.damping * state.velocity) / spring.mass) * h
                this.__turn += state.velocity * h
            }
            if (Math.abs(this.__turn - state.turnTarget) < 0.002 && Math.abs(state.velocity) < 0.02) {
                this.finishSettle()
                return
            }
            this.draw()
            state.raf = requestAnimationFrame(tick)
        }
        state.raf = requestAnimationFrame(tick)
        return true
    }

    finishSettle(){
        var state = this.__settle
        if (!state) return
        this.__settle = null
        cancelAnimationFrame(state.raf)
        this.__turn = state.turnTarget
        this.applyValue(state.target)
        this.finishGesture()
    }

    // Momentum: keep turning at the release speed and slow down; ends in a settle.
    startCoast(gesture, velocity){
        var state = {gesture: gesture, velocity: velocity, last: performance.now()}
        this.__settle = state
        state.turnTarget = this.__turn
        state.target = this.__value
        var tick = now => {
            if (this.__settle !== state) return
            var dt = Math.min(32, Math.max(1, now - state.last))
            state.last = now
            // Friction, ≈325 ms time constant.
            state.velocity *= Math.exp(-dt / 325)
            this.__gesture = gesture
            this.turnFeel(state.velocity * dt)
            state.turnTarget = this.__turn
            state.target = this.__value
            // Reaching an end hands straight over to the spring, carrying the speed into the bounce.
            if (gesture.atEdge || Math.abs(state.velocity) < 0.002) {
                this.__settle = null
                var carry = gesture.atEdge && this.__springyEdges ? state.velocity * 1000 * 0.35 : 0
                if (!this.startSettle(gesture, carry)) this.finishGesture()
                return
            }
            state.raf = requestAnimationFrame(tick)
        }
        state.raf = requestAnimationFrame(tick)
    }

    finishGesture(){
        this.__gesture = null
        this.classRemove('sk_ui_wheel_active')
        var value = this.__value
        if (this.onChangedEnd) this.onChangedEnd(value)
        if (!this.isBounded()) this.__value = 0
        this.draw()
    }

    endGesture(opt){
        if (!this.__gesture) return
        if (this.usesFeel()) {
            var gesture = this.__gesture
            var velocity = opt && opt.velocity
            if (this.__momentum && gesture.kind === 'drag' && Math.abs(velocity) > 0.004 && !gesture.atEdge) {
                this.startCoast(gesture, velocity)
                return
            }
            if (!this.startSettle(gesture)) this.finishGesture()
            return
        }
        this.__gesture = null
        this.classRemove('sk_ui_wheel_active')
        var value = this.__value
        if (this.onChangedEnd) this.onChangedEnd(value)
        if (!this.isBounded()) this.__value = 0
        this.draw()
    }

    // —— Input ——————————————————————————————————————————————————

    // Along the axis, increasing = up (vertical) or right (horizontal).
    axisDelta(dx, dy){
        var along = this.__vertical ? -dy : dx
        return this.__reversed ? -along : along
    }

    // Pointer capture keeps the drag on the wheel even outside it, so no window-wide
    // interaction block (sk.interactions.block) is used: a release that never arrives would
    // leave that overlay up and freeze the whole window. Every way a drag can end ends it.
    setupPointer(){
        var last = null
        // Release speed in notches per ms (smoothed), for momentum. Stale if the pointer rested.
        var velocity = 0
        var end = ()=> {
            if (!last) return
            var pointerId = last.pointerId
            var idle = performance.now() - last.t
            var releaseVelocity = idle > 80 ? 0 : velocity
            last = null
            window.removeEventListener('blur', end)
            try {
                if (this.element.hasPointerCapture(pointerId)) this.element.releasePointerCapture(pointerId)
            } catch (e) {}
            if (this.__gesture && this.__gesture.kind === 'drag') this.endGesture({velocity: releaseVelocity})
        }
        this.element.addEventListener('pointerdown', event => {
            if (event.button !== 0) return
            event.preventDefault()
            event.stopPropagation()
            end()
            this.element.focus({preventScroll: true})
            try { this.element.setPointerCapture(event.pointerId) } catch (e) {}
            last = {x: event.clientX, y: event.clientY, t: performance.now(), pointerId: event.pointerId}
            velocity = 0
            window.addEventListener('blur', end)
            this.beginGesture('drag')
        })
        this.element.addEventListener('pointermove', event => {
            if (!last || event.pointerId !== last.pointerId) return
            // Button no longer held (release missed, e.g. let go outside the window).
            if (!(event.buttons & 1)) {
                end()
                return
            }
            if (!this.__gesture) return
            var now = performance.now()
            var px = this.axisDelta(event.clientX - last.x, event.clientY - last.y)
            var dt = Math.max(1, now - last.t)
            last = {x: event.clientX, y: event.clientY, t: now, pointerId: last.pointerId}
            if (!px) return
            // Fast flicks go further: up to 4× above ~0.6 px/ms.
            var speed = Math.abs(px) / dt
            var accel = Math.min(4, 1 + Math.max(0, speed - 0.6) * 2.5)
            var perNotch = this.__notchPx * (event.shiftKey ? 4 : 1)
            var notches = px / perNotch * (event.shiftKey ? 1 : accel)
            velocity = velocity * 0.6 + (notches / dt) * 0.4
            this.turn(notches)
        })
        this.element.addEventListener('pointerup', end)
        this.element.addEventListener('pointercancel', end)
        this.element.addEventListener('lostpointercapture', end)
    }

    // Mouse wheel / trackpad: one gesture per burst, ended after a short pause.
    // macOS natural scrolling flips the deltas to follow the content; undo that first
    // (sk.pinch reads the setting) so they give the fingers' direction.
    setupWheel(){
        this.element.addEventListener('wheel', event => {
            var natural = !!(sk.pinch && sk.pinch.naturalScroll)
            var dx = natural ? -event.deltaX : event.deltaX
            var dy = natural ? -event.deltaY : event.deltaY
            // Only scrolling along the wheel's own axis turns it. Mostly-across scrolling is left
            // alone (not prevented), so a list or page behind the wheel still scrolls.
            // dx / dy are the fingers' direction (natural scrolling undone), so the ridges follow
            // the fingers exactly as they follow a drag; axisDelta applies `reversed`.
            var onAxis = this.__vertical ? Math.abs(dy) >= Math.abs(dx) : Math.abs(dx) >= Math.abs(dy)
            var raw = onAxis ? this.axisDelta(dx, dy) : 0
            if (!raw) return
            event.preventDefault()
            event.stopPropagation()
            // Line mode (mouse wheel): one notch per line. Pixel mode (trackpad): ~30 px a notch.
            var notches = event.deltaMode === 1 ? raw : raw / 30
            if (event.shiftKey) notches /= 4
            this.beginGesture('wheel')
            this.turn(notches)
            clearTimeout(this.__wheelTimer)
            // Past an end, spring back as soon as the scrolling pauses.
            var pause = this.__gesture && this.__gesture.atEdge && this.__springyEdges ? 70 : 350
            this.__wheelTimer = setTimeout(()=> {
                if (this.__gesture && this.__gesture.kind === 'wheel') this.endGesture()
            }, pause)
        }, {passive: false})
    }

    setupKeys(){
        this.element.addEventListener('keydown', event => {
            var up = this.__vertical ? 'ArrowUp' : 'ArrowRight'
            var down = this.__vertical ? 'ArrowDown' : 'ArrowLeft'
            if (this.__reversed) {
                var swap = up
                up = down
                down = swap
            }
            if (event.key !== up && event.key !== down) return
            event.preventDefault()
            event.stopPropagation()
            this.beginGesture('key')
            this.turn(event.key === up ? 1 : -1)
        })
        this.element.addEventListener('keyup', event => {
            if (this.__gesture && this.__gesture.kind === 'key') this.endGesture()
        })
        this.element.addEventListener('blur', ()=> {
            if (this.__gesture && this.__gesture.kind === 'key') this.endGesture()
        })
    }

    // —— Drawing ————————————————————————————————————————————————

    readColors(){
        var style = getComputedStyle(this.element)
        var read = (name, fallback)=> (style.getPropertyValue(name) || '').trim() || fallback
        return {
            body: read('--sk_ui_wheel_body', '#2b2b2b'),
            shade: read('--sk_ui_wheel_shade', '#0b0b0b'),
            ridge: read('--sk_ui_wheel_ridge', '#d8d8d8'),
            groove: read('--sk_ui_wheel_groove', '#000000')
        }
    }

    draw(){
        var canvas = this.canvas
        if (!canvas) return
        var cssW = this.element.clientWidth
        var cssH = this.element.clientHeight
        if (!(cssW > 0) || !(cssH > 0)) return
        var dpr = window.devicePixelRatio || 1
        var w = Math.round(cssW * dpr)
        var h = Math.round(cssH * dpr)
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w
            canvas.height = h
        }
        if (!this.__colors || this.__colorsFor !== this.element.className) {
            this.__colors = this.readColors()
            this.__colorsFor = this.element.className
        }
        var colors = this.__colors
        var ctx = canvas.getContext('2d')
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, w, h)
        // Work in "length along the axis" (L) and "across" (A) so one routine draws both ways.
        var vertical = this.__vertical
        var L = vertical ? h : w
        var A = vertical ? w : h
        var rect = (along, size, inset)=> {
            if (vertical) ctx.fillRect(inset, along, A - inset * 2, size)
            else ctx.fillRect(along, inset, size, A - inset * 2)
        }

        // Body: a cylinder, lit in the middle and falling off to the ends.
        var gradient = vertical ? ctx.createLinearGradient(0, 0, 0, h) : ctx.createLinearGradient(0, 0, w, 0)
        gradient.addColorStop(0, colors.shade)
        gradient.addColorStop(0.5, colors.body)
        gradient.addColorStop(1, colors.shade)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, w, h)

        // Ridges: evenly spaced in angle, so they bunch up and thin toward the ends.
        var radius = L / 2
        var spacing = Math.PI / 14
        var bounded = this.isBounded()
        var ends = bounded ? this.bounds() : null
        var shown = bounded ? this.visualValue() : 0
        // Bounded smooth / springy wheels put one ridge on every step of the value grid, so the
        // ridge at an end is exactly on it. Others keep the free-spinning phase.
        var gridded = bounded && this.usesFeel()
        // Drawn ridge pitch: the step, nudged so the range holds a whole number of ridges and
        // both min and max land exactly on one (e.g. 103.73 steps → 104 ridges).
        var pitch = this.__step
        if (gridded) {
            var count = Math.max(1, Math.round((ends.hi - ends.lo) / this.__step))
            pitch = (ends.hi - ends.lo) / count || this.__step
        }
        var turnPos = gridded ? (shown - ends.lo) / pitch : this.__turn
        var phase = ((turnPos * spacing) % spacing + spacing) % spacing
        var ridge = Math.max(1, 1.6 * dpr)
        var inset = Math.round(A * 0.18)
        // Bounded: ridges past min / max are dimmed, so the end of travel is visible.
        // A ridge d notches toward "increase" from the center stands for value − d·step.
        for (var k = -16; k <= 16; k++) {
            var angle = k * spacing + phase
            if (Math.abs(angle) >= Math.PI / 2) continue
            var facing = Math.cos(angle)
            var fade = 1
            if (bounded) {
                var at = shown - (angle / spacing) * (gridded ? pitch : this.__step)
                var beyond = Math.max(ends.lo - at, at - ends.hi, 0) / this.__step
                // Gridded ridges are either in range (lit) or past it (dimmed); the tolerance
                // absorbs float drift so the ridge sitting on an end is always fully lit.
                fade = gridded ? (beyond > 1e-3 ? 0.12 : 1) : 1 - 0.88 * Math.min(1, beyond / 0.5)
            }
            // Ridges travel toward the increasing side: up / right, or down / left when reversed.
            // (Up is −L on screen for vertical wheels.)
            var toward = (vertical ? -1 : 1) * (this.__reversed ? -1 : 1)
            var along = radius + toward * radius * Math.sin(angle)
            var size = Math.max(0.6 * dpr, ridge * facing)
            ctx.globalAlpha = (0.15 + 0.6 * facing * facing) * fade
            ctx.fillStyle = colors.groove
            rect(along - size / 2 + size * 0.6, size, inset)
            ctx.fillStyle = colors.ridge
            rect(along - size / 2, size, inset)
        }
        ctx.globalAlpha = 1
    }
}
