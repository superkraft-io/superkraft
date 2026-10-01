/**
 * Thumbwheel: a ridged cylinder seen edge-on that you spin to change a value.
 *
 * Each notch is one `step`. Turn it by dragging along its axis, with the mouse wheel or a
 * trackpad, or with the arrow keys when focused. Hold Shift for finer turning; fast flicks
 * go further. Up (vertical) or right (horizontal) increases.
 *
 * Two modes:
 * - Relative (default, no min / max): `value` is the total since the gesture started, and it
 *   springs back to 0 when the gesture ends. For nudges such as "grow by".
 * - Bounded (both `min` and `max` set): `value` is kept between them and stays where it is.
 *   Double-click resets it to `defaultValue`.
 *
 * Callbacks: onChangedStart(value), onChanged(value, delta), onChangedEnd(value).
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

    beginGesture(kind){
        if (this.__gesture) {
            if (this.__gesture.kind === kind) return
            // Another kind of turn is still open (e.g. a scroll burst when a drag starts):
            // finish it first, so the new one is never ignored.
            this.endGesture()
        }
        this.__gesture = {kind: kind, startValue: this.isBounded() ? this.__value : 0, notches: 0, carry: 0}
        if (!this.isBounded()) this.__value = 0
        this.classAdd('sk_ui_wheel_active')
        if (this.onChangedStart) this.onChangedStart(this.__value)
    }

    // Turn by a number of notches (may be fractional; whole notches change the value).
    turn(notches){
        var gesture = this.__gesture
        if (!gesture || !notches) return
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

    endGesture(){
        if (!this.__gesture) return
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
        return this.__vertical ? -dy : dx
    }

    // Pointer capture keeps the drag on the wheel even outside it, so no window-wide
    // interaction block (sk.interactions.block) is used: a release that never arrives would
    // leave that overlay up and freeze the whole window. Every way a drag can end ends it.
    setupPointer(){
        var last = null
        var end = ()=> {
            if (!last) return
            var pointerId = last.pointerId
            last = null
            window.removeEventListener('blur', end)
            try {
                if (this.element.hasPointerCapture(pointerId)) this.element.releasePointerCapture(pointerId)
            } catch (e) {}
            if (this.__gesture && this.__gesture.kind === 'drag') this.endGesture()
        }
        this.element.addEventListener('pointerdown', event => {
            if (event.button !== 0) return
            event.preventDefault()
            event.stopPropagation()
            end()
            this.element.focus({preventScroll: true})
            try { this.element.setPointerCapture(event.pointerId) } catch (e) {}
            last = {x: event.clientX, y: event.clientY, t: performance.now(), pointerId: event.pointerId}
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
            this.turn(px / perNotch * (event.shiftKey ? 1 : accel))
        })
        this.element.addEventListener('pointerup', end)
        this.element.addEventListener('pointercancel', end)
        this.element.addEventListener('lostpointercapture', end)
    }

    // Mouse wheel / trackpad: one gesture per burst, ended after a short pause.
    // Goes by physical direction (finger or wheel up turns it up): macOS natural scrolling
    // flips the deltas to follow the content, so undo that (sk.pinch reads the setting).
    setupWheel(){
        this.element.addEventListener('wheel', event => {
            event.preventDefault()
            event.stopPropagation()
            var natural = !!(sk.pinch && sk.pinch.naturalScroll)
            var dx = natural ? -event.deltaX : event.deltaX
            var dy = natural ? -event.deltaY : event.deltaY
            var useX = Math.abs(dx) > Math.abs(dy)
            var raw = useX ? dx : -dy
            if (!raw) return
            // Line mode (mouse wheel): one notch per line. Pixel mode (trackpad): ~30 px a notch.
            var notches = event.deltaMode === 1 ? raw : raw / 30
            if (event.shiftKey) notches /= 4
            this.beginGesture('wheel')
            this.turn(notches)
            clearTimeout(this.__wheelTimer)
            this.__wheelTimer = setTimeout(()=> {
                if (this.__gesture && this.__gesture.kind === 'wheel') this.endGesture()
            }, 350)
        }, {passive: false})
    }

    setupKeys(){
        this.element.addEventListener('keydown', event => {
            var up = this.__vertical ? 'ArrowUp' : 'ArrowRight'
            var down = this.__vertical ? 'ArrowDown' : 'ArrowLeft'
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
        var phase = ((this.__turn * spacing) % spacing + spacing) % spacing
        var ridge = Math.max(1, 1.6 * dpr)
        var inset = Math.round(A * 0.18)
        for (var k = -16; k <= 16; k++) {
            var angle = k * spacing + phase
            if (Math.abs(angle) >= Math.PI / 2) continue
            var facing = Math.cos(angle)
            // Up is +L in value but −L on screen for vertical wheels.
            var along = vertical ? radius - radius * Math.sin(angle) : radius + radius * Math.sin(angle)
            var size = Math.max(0.6 * dpr, ridge * facing)
            ctx.globalAlpha = 0.15 + 0.6 * facing * facing
            ctx.fillStyle = colors.groove
            rect(along - size / 2 + size * 0.6, size, inset)
            ctx.fillStyle = colors.ridge
            rect(along - size / 2, size, inset)
        }
        ctx.globalAlpha = 1
    }
}
