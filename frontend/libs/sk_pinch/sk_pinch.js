// Directional trackpad pinch.
//
// The engine forwards native pinch samples (finger positions + magnification).
// The axis is locked once per gesture from the angle of the line between the
// two fingers, then a bubbling 'sk_pinch' event is dispatched on the element
// that was under the pointer when the pinch began:
//
//   el.addEventListener('sk_pinch', e => {
//       var {phase, axis, scale, scaleX, scaleY, clientX, clientY} = e.detail
//   })
//
// phase: 'begin' | 'update' | 'end'. axis: 'x' | 'y' | 'xy'.
// scale > 1 means zoom in (fingers spreading); scaleX / scaleY are 1 on the
// axis that is not zooming.
//
// Chromium still turns every pinch into ctrl+wheel. Handlers that use
// sk_pinch should skip those with sk.pinch.isPinchWheel(event).

class SK_Pinch {
    constructor(opt = {}){
        this.native = !!opt.native

        // Finger line within this many degrees of horizontal zooms x, of vertical
        // zooms y; anything in between zooms both.
        this.axisLockDegrees = 30

        this.pointer = {x: window.innerWidth / 2, y: window.innerHeight / 2}
        this.ctrlDown = false
        this.gesture = null

        var track = event => {
            this.pointer.x = event.clientX
            this.pointer.y = event.clientY
            this.ctrlDown = !!event.ctrlKey
        }
        window.addEventListener('pointermove', track, {capture: true, passive: true})
        window.addEventListener('pointerdown', track, {capture: true, passive: true})
        window.addEventListener('keydown', event => { if (event.key === 'Control') this.ctrlDown = true }, true)
        window.addEventListener('keyup', event => { if (event.key === 'Control') this.ctrlDown = false }, true)
        window.addEventListener('blur', () => { this.ctrlDown = false })
    }

    // A ctrl+wheel that Chromium synthesized from a pinch (Control not held).
    isPinchWheel(event){
        return this.native && !!event.ctrlKey && !this.ctrlDown
    }

    axisFromTouches(sample){
        var touches = sample.touches
        if (!touches || touches.length < 2) return null
        var dx = Math.abs(touches[0].x - touches[1].x) * (sample.deviceWidth || 1)
        var dy = Math.abs(touches[0].y - touches[1].y) * (sample.deviceHeight || 1)
        var degrees = Math.atan2(dy, dx) * 180 / Math.PI
        if (degrees <= this.axisLockDegrees) return 'x'
        if (degrees >= 90 - this.axisLockDegrees) return 'y'
        return 'xy'
    }

    handle(sample){
        if (!sample) return

        if (sample.phase === 'begin' || !this.gesture) {
            var target = document.elementFromPoint(this.pointer.x, this.pointer.y) || document.body
            this.gesture = {
                target: target,
                clientX: this.pointer.x,
                clientY: this.pointer.y,
                axis: null,
                pendingScale: 1,
                pendingEvents: 0,
                begun: false
            }
        }

        var gesture = this.gesture
        var scale = Math.max(0.1, 1 + (sample.magnification || 0))

        // Touches can trail the first magnify event; hold zoom until the axis is known.
        if (!gesture.axis) {
            gesture.axis = this.axisFromTouches(sample)
            if (!gesture.axis && sample.phase !== 'end' && gesture.pendingEvents < 3) {
                gesture.pendingScale *= scale
                gesture.pendingEvents++
                return
            }
            if (!gesture.axis) gesture.axis = 'x'
            scale *= gesture.pendingScale
        }

        if (!gesture.begun) {
            gesture.begun = true
            this.dispatch('begin', 1)
        }

        if (sample.phase === 'end') {
            if (scale !== 1) this.dispatch('update', scale)
            this.dispatch('end', 1)
            this.gesture = null
            return
        }

        this.dispatch('update', scale)
    }

    dispatch(phase, scale){
        var gesture = this.gesture
        var zoomX = gesture.axis === 'x' || gesture.axis === 'xy'
        var zoomY = gesture.axis === 'y' || gesture.axis === 'xy'
        gesture.target.dispatchEvent(new CustomEvent('sk_pinch', {
            bubbles: true,
            detail: {
                phase: phase,
                axis: gesture.axis,
                scale: scale,
                scaleX: zoomX ? scale : 1,
                scaleY: zoomY ? scale : 1,
                clientX: gesture.clientX,
                clientY: gesture.clientY
            }
        }))
    }
}
