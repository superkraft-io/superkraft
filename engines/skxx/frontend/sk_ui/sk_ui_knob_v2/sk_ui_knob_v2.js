class sk_ui_knob_v2 extends sk_ui_draggable_component {
    constructor(opt) {
        super(opt)

        this.infoHint = { icon: 'mouse', text: 'Shift + Mouse Wheel for +/- 1%. Double Click to reset.' }

        this.compact = true

        this.angleRange = { min: 0, max: 360 }

        this.__progressbarOffset = 8

        this.__accentColor = '#00ff88'
        this.__ringThickness = 8
        this.__ringRadius = 100
        this.__ringBackgroundColor = 'rgba(255,255,255,0.25)'
        this.__ringThicknessOffset = 0
        this.__angleStart = -120
        this.__angleStop = 120

        this.cursor = 'pointer'

        // Main knob body
        this.knobBody = this.add.component(_c => {
            _c.classAdd('sk_ui_knob_universal_body')
            _c.animate = false
        })

        // Value indicator ring drawn on canvas for crisp antialiasing
        this.valueIndicator = this.add.fromClass(sk_ui_knob_v2_valueIndicatorCanvas, _c => {
            _c.animate = false
        })

        // Rotating pointer/needle
        this.pointerContainer = this.add.component(_c => {
            _c.classAdd('sk_ui_knob_universal_pointerContainer')
            _c.animate = false

            this.pointer = _c.add.component(_c => {
                _c.classAdd('sk_ui_knob_universal_pointer')
            })
        })

        // Value display
        this.valueInput = this.add.input(_c => {
            _c.classAdd('sk_ui_knob_universal_input')
            _c.value = this.defaultValue
            _c.disableFocus = true
        })

        const resizeObserver = new ResizeObserver((entries) => {
            this.__redraw()
        })

        resizeObserver.observe(this.element)

        this.initiated = true
    }

    __redraw(){
        this.valueIndicator.draw()
    }

    doUodate(value) {
        if (!this.initiated) return

        this.valueInput.value = (this.formatValueLabel ? this.formatValueLabel(value) : value)

        // Calculate rotation angle for pointer to match ring angle range
        var angle = sk.utils.map(value, this.valueRange.min, this.valueRange.max, this.__angleStart, this.__angleStop)
        this.pointerContainer.style.transform = `rotate(${angle}deg)`

        // Calculate progress percentage for value indicator (0-100)
        var progressPercent = sk.utils.map(value, this.valueRange.min, this.valueRange.max, 0, 100)
        this.valueIndicator.progress = progressPercent
        this.valueIndicator.draw()

        if (this.onChanged) this.onChanged(value)
    }

    
    calculateAngle(point){
        const deltaY = point.x - (this.rect.height / 2);
        const deltaX = point.y - (this.rect.width / 2);
        const angleInRadians = Math.atan2(deltaY, deltaX);
        const angleInDegrees = angleInRadians * (180 / Math.PI);
        return angleInDegrees;
    }

    calcDistance(x1, y1, x2, y2) {
        const X = x2 - x1;
        const Y = y2 - y1;
        return Math.sqrt(X * X + Y * Y);
    }

    set size(val) {
        this.style.width = val + 'px'
        this.style.height = val + 'px'
        this.__redraw()
    }

    set accentColor(val) {
        this.__accentColor = val
        this.pointer.style.backgroundColor = val
        this.valueIndicator.draw()
    }

    set ringThickness(val) {
        this.__ringThickness = val
        this.valueIndicator.draw()
    }

    set ringRadius(val) {
        this.__ringRadius = val
        this.valueIndicator.draw()
    }

    set ringBackgroundColor(val) {
        this.__ringBackgroundColor = val
        this.valueIndicator.draw()
    }

    set ringThicknessOffset(val) {
        this.__ringThicknessOffset = val
        this.valueIndicator.draw()
    }

    set angleStart(val) {
        this.__angleStart = val
        this.valueIndicator.draw()
    }

    set angleStop(val) {
        this.__angleStop = val
        this.valueIndicator.draw()
    }

    set showValueLabel(val) {
        this.valueInput.style.display = val ? 'block' : 'none'
    }

    set cursorHidden(val) {
        this.pointerContainer.style.display = val ? 'none' : ''
    }

    set value(val){
        var _val = val
        if (_val > this.valueRange.max) _val = this.valueRange.max
        if (_val < this.valueRange.min) _val = this.valueRange.min
            
        this.__value = _val

        this.doUodate(_val)
    }

    get value(){
        return this.__value
    }
}

class sk_ui_knob_v2_valueIndicatorCanvas extends sk_ui_canvas {
    constructor(opt) {
        super(opt)
        this.progress = 0
        
        // Call update to initialize canvas size
        this.update()
        
        // Draw on next tick when canvas is ready
        setTimeout(() => {
            this.draw()
        }, 10)
    }

    update() {
        super.update()
        this.draw()
    }

    draw() {
        // Make sure context exists
        if (!this.ctx) {
            console.error('Canvas context not available')
            return
        }
        
        this.clear()
        
        const rect = this.rect
        if (rect.width === 0 || rect.height === 0) {
            console.warn('Canvas rect is zero:', rect)
            return
        }
        
        const parent = this.parent

        var start = sk.utils.map(0, this.parent.valueRange.min, parent.valueRange.max, parent.__angleStart, parent.__angleStop)
        var end = sk.utils.map(parent.value, this.parent.valueRange.min, parent.valueRange.max, parent.__angleStart, parent.__angleStop)
        if (parent.value < 0){
            const temp = start
            start = end
            end = temp
        }

        this.drawFromToDeg(start, end)
    }

    drawFromToDeg(fromDeg, toDeg, color = null, thickness = null) {
        if (!this.ctx) return
        
        const rect = this.rect
        if (rect.width === 0 || rect.height === 0) return
        
        const centerX = (rect.width / 2) * this.ratio
        const centerY = (rect.height / 2) * this.ratio
        const radius = (Math.min(rect.width, rect.height) / 2) * this.ratio
        
        const parent = this.parent
        const baseRingRadius = (parent.__ringRadius / 100) * radius
        const ringThickness = (thickness !== null ? thickness : parent.__ringThickness) * this.ratio
        const ringThicknessOffset = parent.__ringThicknessOffset * this.ratio
        const ringRadius = baseRingRadius + ringThicknessOffset - (ringThickness / 2)
        
        // Convert degrees to radians (subtract 90 to start from top)
        const fromRad = (fromDeg - 90) * Math.PI / 180
        const toRad = (toDeg - 90) * Math.PI / 180
        
        const ctx = this.ctx
        ctx.strokeStyle = color !== null ? color : parent.__accentColor
        ctx.lineWidth = ringThickness
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, fromRad, toRad)
        ctx.stroke()
    }
}
