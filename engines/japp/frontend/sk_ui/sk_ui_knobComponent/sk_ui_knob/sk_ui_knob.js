class sk_ui_knob extends sk_ui_juce_param_component_draggable {
    constructor(opt) {
        super(opt)


        this.infoHint = { icon: 'mouse', text: 'Shift + Mouse Wheel for +/- 1%. Double Click to reset.' }

        this.compact = true


        
        this.angleRange = { min: 0, max: 270 }

        this.__progressbarOffset = 10

        this.__ticks = [
            { length: 10, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 3, thickness: 1, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 3, thickness: 1, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 3, thickness: 1, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 3, thickness: 1, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 10, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 3, thickness: 1, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 3, thickness: 1, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 3, thickness: 1, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 3, thickness: 1, color: 'white' },
            { length: 1, thickness: 1, color: 'grey' },
            { length: 10, color: 'white' },

        ]


        this.ticksCanvas = this.add.fromNew(sk_ui_knob_ticks)

        this.knobTicksCanvas = this.add.fromNew(sk_ui_knob_knobTicks, _c => {
            _c.animate = false
        })

        this.cursor = 'pointer'

        this.knobFaceImg = this.add.image(_c => {
            _c.classAdd('sk_ui_knob_face sk_ui_shadow_black')
            _c.tabIndex = 1
        })

        this.knobFaceTextureImg = this.add.image(_c => {
            _c.classAdd('sk_ui_knob_face_texture')
            _c.animate = false
        })



        this.innerGlow = this.add.fromNew(sk_ui_knob_innerGlow, _c => {
            _c.animate = false
        })
        this.outerGlow = this.add.fromNew(sk_ui_knob_outerGlow, _c => {
            _c.animate = false
        })



        this.infoContainerWrapper = this.add.component(_c => {
            _c.classAdd('infoContainerWrapper')
            _c.animate = false

            this.infoContainer = _c.add.component(_c => {
                _c.classAdd('sk_ui_knob_infoContainer')

                _c.compact = true

                this.arrowContainer = _c.add.component(_c => {
                    _c.classAdd('sk_ui_knob_arrowContainer')

                    _c.animate = false

                    this.arrow = _c.add.component(_c => {
                        _c.classAdd('sk_ui_knob_arrow')
                    })
                })

                this.progressBarPlaceholder = _c.add.progressBar(_c => {
                    _c.classAdd('sk_ui_knob_progressbar')


                    _c.as.circle({ color: 'rgba(255,255,255,0.3)', thickness: 2, duration: 0 })

                    _c.animate = false
                    _c.container.animate = false

                    _c.progress = 100
                })

                this.progressBar = _c.add.progressBar(_c => {
                    _c.classAdd('sk_ui_knob_progressbar')


                    _c.as.circle({ color: 'white', thickness: 2, duration: 0 })

                    _c.animate = false
                    _c.container.animate = false
                })


            })
        })

        this.valueInput = this.add.input(_c => {
            _c.classAdd('sk_ui_knob_input')
            _c.value = this.defaultValue
            _c.disableFocus = true
        })



        const resizeObserver = new ResizeObserver((entries) => {
            this.progressBar.size = this.rect.width + this.__progressbarOffset

            this.progressBarPlaceholder.size = this.rect.width + this.__progressbarOffset

            this.ticksCanvas.draw()
            this.knobTicksCanvas.draw()
        })

        resizeObserver.observe(this.element)





        this.angleOffset = -135
    }

    set angleOffset(val) {
        this.__angleOffset = val
        this.infoContainer.style.transform = `rotate(${-90 + val}deg)`
    }

    

    set progressbarOffset(val) {
        if (val === this.__progressbarOffset) return
        this.__progressbarOffset = val
        this.progressBar.size = this.rect.width + this.__progressbarOffset
    }
    

    onUpdate(value) {
        this.valueInput.value = (this.formatValueLabel ? this.formatValueLabel(value) : value)

        var angle = sk.utils.map(value, this.valueRange.min, this.valueRange.max, 0, this.angleRange.max)

        this.arrowContainer.style.transform = 'rotate(' + angle + 'deg)'


        var pbAngle = sk.utils.map(0, this.valueRange.min, this.valueRange.max, 0, 270) + 90
       
        this.progressBar.style.transform = `rotate(${pbAngle}deg)`;

        var angleRangeMax_PB = sk.utils.map(this.angleRange.max, 0, 360, 0, 100)
        this.progressBar.progress = sk.utils.map(value, 0, this.valueRange.max - this.valueRange.min, 0, angleRangeMax_PB)

        this.progressBarPlaceholder.style.transform = `rotate(${pbAngle - 135}deg)`;
        this.progressBarPlaceholder.progress = sk.utils.map(100, 0, 100, 0, angleRangeMax_PB)

        this.knobFaceTextureImg.style.transform = `rotate(${angle}deg)`;

        this.innerGlow.angle = angle - 135
        this.outerGlow.angle = angle - 135
        this.knobTicksCanvas.style.transform = `rotate(${angle}deg)`;

        if (this.onChanged) this.onChanged(value)
    }

    

    calculateAngle(point){
        const deltaY = point.x - (this.rect.height / 2);
        const deltaX = x2 - (this.rect.width / 2);
        const angleInRadians = Math.atan2(deltaY, deltaX);
        const angleInDegrees = angleInRadians * (180 / Math.PI);
        return angleInDegrees;
    }

    calcDistance(x1, y1, x2, y2) {
        const X = x2 - x1;
        const Y = y2 - y1;
        return Math.sqrt(X * X + Y * Y);
    }

    set knobFace(val) {
        this.knobFaceImg.url = val
    }

    set knobFaceTexture(val) {
        this.knobFaceTextureImg.url = val
    }

    set knobSize(val) {
        this.style.width = val + 'px'
        this.style.height = val + 'px'
        this.progressBar.color = this.progressBar.color
    }

    set ticks(arr) {
        this.__ticks = arr
        this.ticksCanvas.draw()
    }

    set indicationColor(val) {
        this.progressBar.color = val
        this.innerGlow.color = val
        this.outerGlow.color = val
    }
}


class sk_ui_knob_ticks extends sk_ui_canvas {
    constructor(opt) {
        super(opt)

        this.draw()

    }

    draw() {
        this.clear()

        var tickCount = this.parent.__ticks.length - 1

        var rect = this.rect

        var centerPoint = { x: rect.width / 2, y: rect.height / 2 }



        var degreesPerTick = ((this.parent.angleRange.max - this.parent.angleRange.min)) / tickCount

        for (var i = 0; i <= tickCount; i++) {
            var tick = this.parent.__ticks[i]

            var angle = degreesPerTick * i

            var startPoint = this.calculatePoint(centerPoint.x, centerPoint.y, this.parent.rect.width / 2 + this.parent.__progressbarOffset - 4, angle)
            var endPoint = this.calculatePoint(centerPoint.x, centerPoint.y, this.parent.rect.width / 2 + this.parent.__progressbarOffset + tick.length - 4, angle)

            this.line({
                from: startPoint,
                to: endPoint,
                color: tick.color || 'grey',
                thickness: tick.thickness || 1
            })
        }
    }

    calculatePoint(centerX, centerY, distance, angleInDegrees) {
        const angleInRadians = (-90 + angleInDegrees + this.parent.__angleOffset) * (Math.PI / 180);
        const x = centerX + distance * Math.cos(angleInRadians);
        const y = centerY + distance * Math.sin(angleInRadians);
        return { x, y };
    }
}

class sk_ui_knob_knobTicks extends sk_ui_canvas {
    constructor(opt) {
        super(opt)

        this.draw()

    }

    draw() {
        this.clear()
        var rect = this.rect
        var centerPoint = { x: rect.width / 2, y: rect.height / 2 }
        var tickCount = 360 / 4
        var degreesPerTick = 360 / tickCount

        var tickLength = 3

        for (var i = 0; i < tickCount; i++) {
            var angle = degreesPerTick * i

            var startPoint = this.calculatePoint(centerPoint.x, centerPoint.y, this.parent.rect.width / 2 - tickLength, angle)
            var endPoint = this.calculatePoint(centerPoint.x, centerPoint.y, this.parent.rect.width / 2, angle)

            this.line({
                from: startPoint,
                to: endPoint,
                color: 'white',
                thickness: 1
            })


            var startPoint = this.calculatePoint(centerPoint.x, centerPoint.y, this.parent.rect.width / 2 - tickLength, angle + 1)
            var endPoint = this.calculatePoint(centerPoint.x, centerPoint.y, this.parent.rect.width / 2, angle + 1)

            this.line({
                from: startPoint,
                to: endPoint,
                color: 'black',
                thickness: 1
            })
        }
    }

    calculatePoint(centerX, centerY, distance, angleInDegrees) {
        const angleInRadians = angleInDegrees * (Math.PI / 180);
        const x = centerX + distance * Math.cos(angleInRadians);
        const y = centerY + distance * Math.sin(angleInRadians);
        return { x, y };
    }
}

class sk_ui_knob_innerGlow extends sk_ui_component {
    constructor(opt) {
        super(opt)

        this.color = 'white'
    }

    set color(val) {
        this.__color = val
        this.style.boxShadow = `inset 0px -3px 8px 2px ${this.__color}`;
    }

    set angle(val) {
        var targetVal = val
        if (val < 0) {
            this.style.transform = 'scaleX(-1)'
            targetVal = 0 - val
        } else this.style.transform = 'scaleX(1)'

        this.style.mask = `conic-gradient(black 0deg, black ${targetVal}deg, transparent 0deg)`;
    }
}

class sk_ui_knob_outerGlow extends sk_ui_component {
    constructor(opt) {
        super(opt)


        this.glow = this.add.component(_c => {
            _c.classAdd('sk_ui_knob_outerGlow_glow')
            _c.animate = false
        })


        this.color = 'white'
    }

    set color(val) {
        this.glow.backgroundColor = val
    }

    set angle(val) {
        var targetVal = val
        if (val < 0) {
            this.style.transform = 'scaleX(-1)'
            targetVal = 0 - val
        } else this.style.transform = 'scaleX(1)'

        this.style.mask = `conic-gradient(black 0deg, black ${targetVal}deg, transparent 0deg)`;
    }
}