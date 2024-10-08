class sk_ui_vu_meter extends sk_ui_component {
    constructor(opt) {
        super(opt)

        this.infoHint = { icon: 'volume up', text: 'Gain. Double-click to reset. Shift+Drag/Scroll to finetune.' }

        this.vertical = false


        this.leftSignal = this.add.fromNew(sk_ui_vu_meter_signal, _c => {
            _c.juceParamID = 'Input Volume'

            _c.label.text = 'INPUT'

            _c.channels.gainSlider.onMouseDown = async val => {
            }

            _c.channels.gainSlider.onMouseUp = async val => {
            }

            _c.channels.gainSlider.onChanged = async val => {
            }
        })


        this.rightSignal = this.add.fromNew(sk_ui_vu_meter_signal, _c => {
            _c.juceParamID = 'Output Volume'

            _c.label.text = 'OUTPUT'
            _c.channels.gainSlider.cursorSide = 'right'

            _c.channels.gainSlider.onMouseDown = async val => {
            }

            _c.channels.gainSlider.onMouseUp = async val => {
            }

            _c.channels.gainSlider.onChanged = async val => {
            }
        })

        this.add.fromNew(sk_ui_vu_meter_dbLabels)
    }
}

class sk_ui_vu_meter_signal extends sk_ui_component {
    constructor(opt) {
        super(opt)


        this.valueLabel = this.add.inputLabel(_c => {
            _c.classAdd('sk_ui_vu_meter_signal_valueLabel')
            _c.type = 'number'
            _c.min = 0
            _c.max = 150

            _c.value = 100

            _c.add.label(_c => {
                _c.classAdd('sk_ui_vu_meter_signal_valueLabel_suffix')
                _c.text = '%'
            })

            _c.onValueSet = val => {
                this.channels.value = val
                this.channels.applyValue()
            }
        })


        this.channels = this.add.fromNew(sk_ui_vu_meter_signal_channels)

        this.label = this.add.label(_c => {
            _c.classAdd('sk_ui_vu_meter_signal_label')
            _c.text = 'SIGNAL'
        })
    }
}

class sk_ui_vu_meter_signal_channels extends sk_ui_juce_param_component_draggable {
    constructor(opt) {
        super(opt)


        this.style.position = 'relative'

        this.styling += ' fullheight'


        this.vertical = false
        this.compact = true

        this.channels = {}

        this.channels.left = this.add.fromNew(sk_ui_vu_meter_signal_channel, _c => {
            _c.marginRight = 4
        })

        this.channels.right = this.add.fromNew(sk_ui_vu_meter_signal_channel)

        this.gainSlider = this.add.fromNew(sk_ui_vu_meter_gain_slider, _c => {

        })

        this.valueRange.min = 0
        this.valueRange.max = 150

        this.defaultValue = 100
    }

    onUpdate(val) {
        if (!this.parent.valueLabel.focused) this.parent.valueLabel.value = Math.round(val)
        this.gainSlider.updateGainUI(val)
    }

    setValueFromExternalSource(value) {
        this.value = value
        this.onUpdate(value)
        this.applyValue()
    }
}

class sk_ui_vu_meter_gain_slider extends sk_ui_component {
    constructor(opt) {
        super(opt)

        this.__gain = 100

        this.cursor = this.add.button(_c => {
            _c.classAdd('sk_ui_vu_meter_signal_cursor')
            _c.animate = false

            _c.styling += ' fullwidth'

            _c.compact = true

            _c.label.remove()
            _c._icon.remove()

            _c.style.top = '25%'

            _c.cursor = 'n-resize'



            _c.add.component(_c => {
                _c.styling += ' fullwidth'
                _c.height = 10

                _c.add.component(_c => {
                    _c.styling += ' fullwidth'
                    _c.height = 1
                    _c.backgroundColor = 'white'
                })
            })

            this.cursorPointer = _c.add.component(_c => {
                _c.classAdd('sk_ui_vu_meter_signal_cursor_pointer')

                /*this.cursorLabel = _c.add.label(_c => {
                    _c.classAdd('sk_ui_vu_meter_signal_cursor_pointer_label')
                    _c.text = '100%'
                })*/
            })



            const resizeObserver = new ResizeObserver((entries) => {
                _c.movres_izer.mover.constraints.y.max = this.rect.height
            })

            resizeObserver.observe(this.element)


            //_c.movable = 'y'
            _c.movres_izer.mover.offset.y = 5

            _c.movres_izer.mover.onStart = res => {
                this.instantPosition = true

                this.cursorTweener.stop()
                var gainVal = this.mapPxToGain(res.position.y)
                this.cursorTweener.target = gainVal
                this.cursorTweener.current = gainVal

                if (this.onMouseDown) this.onMouseDown()
            }

            _c.movres_izer.mover.onEnd = () => {
                this.instantPosition = false

                if (this.onMouseUp) this.onMouseUp()
            }

            _c.movres_izer.mover.onMoving = res => {
                this.gain = this.mapPxToGain(res.position.y)
            }

            _c.element.addEventListener('keydown', _e => {
                if (_e.code === 'ArrowUp') this.gain += (_e.shiftKey ? 1 : 5)
                else if (_e.code === 'ArrowDown') this.gain -= (_e.shiftKey ? 1 : 5)
            })
        })

    }

    updateGainUI(gainVal) {
        var posY = this.mapGainToPx(gainVal)
        this.cursor.style.top = Math.round(posY) + 'px'
        //this.cursorLabel.text = Math.round(gainVal) + '%'

        if (this.onChanged) this.onChanged(gainVal)
    }

    mapPxToGain(posVal) {
        var _gain = sk.utils.map(posVal, this.rect.height * 0.25, this.rect.height, 100, 0)
        if (_gain > 100) _gain = sk.utils.map(posVal, 0, this.rect.height * 0.25, 150, 100)
        return _gain
    }

    mapGainToPx(gainVal) {
        var posY = sk.utils.map(gainVal, 100, 0, this.rect.height * 0.25, this.rect.height)
        if (gainVal > 100) posY = sk.utils.map(gainVal, 150, 100, 0, this.rect.height * 0.25)
        return posY
    }

    set gain(val) {
        this.value = val
    }

    get gain() {
        return this.value
    }

    set cursorSide(val) {
        this.cursorPointer.classAdd('sk_ui_vu_meter_signal_cursor_pointer_rightSide')
    }
}

class sk_ui_vu_meter_signal_channel extends sk_ui_component {
    constructor(opt) {
        super(opt)

        this.compact = true

        this.add.component(_c => {
            _c.styling += ' fullwidth fullheight'
            _c.classAdd('sk_ui_vu_meter_signal_channel_signal sk_ui_vu_meter_signal_channel_signal_gradient sk_ui_vu_meter_signal_channel_signal_background')
        })

        this.highlight = this.add.component(_c => {
            _c.styling += ' fullwidth fullheight'
            _c.classAdd('sk_ui_vu_meter_signal_channel_signal sk_ui_vu_meter_signal_channel_signal_gradient sk_ui_vu_meter_signal_channel_signal_highlight')
        })

        this.highlightGlowWrapper = this.add.component(_c => {
            _c.classAdd('sk_ui_vu_meter_signal_channel_signal_highlight_glowWrapper')
            this.highlightGlow = _c.add.component(_c => {
                _c.styling += ' fullwidth fullheight'
                _c.classAdd('sk_ui_vu_meter_signal_channel_signal sk_ui_vu_meter_signal_channel_signal_gradient sk_ui_vu_meter_signal_channel_signal_highlight_glow')
            })
        })

        this.peakHoldHandle = this.add.fromNew(sk_ui_vu_meter_peakHoldHandle)

        this.value = 0
    }

    set value(val) {
        this.__value = val
        this.highlight.style.maskImage = `linear-gradient(to bottom, transparent, transparent ${100 - val}%, white ${100 - val}%, white)`
        this.highlightGlow.style.maskImage = `linear-gradient(to bottom, transparent, transparent ${100 - val}%, white ${100 - val}%, white)`

        this.peakHoldHandle.value = val
    }

    get value() {
        return this.__value
    }
}

class sk_ui_vu_meter_peakHoldHandle extends sk_ui_component {
    constructor(opt) {
        super(opt)

        this.animate = false
    }

    set value(val) {
        if (val <= this.__value) return;

        this.__value = val
        this.style.bottom = val + '%'

        this.resetDropTimer()
    }

    resetDropTimer() {

        clearInterval(this.__startDroppingTimer)

        clearTimeout(this.__startDropDelayTimer)
        this.__startDropDelayTimer = setTimeout(() => {
            this.startDropTimer()
        }, 3000)
    }

    startDropTimer() {
        this.__startDroppingTimer = setInterval(() => {
            this.__value -= 0.2
            if (this.__value < 0) {
                this.__value = 0
                clearInterval(this.__startDroppingTimer)
                return
            }

            this.update()
        }, 30)
    }

    update() {
        this.style.bottom = this.__value + '%'
    }
}

class sk_ui_vu_meter_dbLabels extends sk_ui_canvas {
    constructor(opt) {
        super(opt)

        this.update()
    }

    onResize() {
        var ticks = [
            { text: '+20', pos: 0 },
            { text: '+15', pos: 10 },
            { text: '0', pos: 25 },
            { text: '-25', pos: 39 },
            { text: '-50', pos: 52.5 },
            { text: '-100', pos: 80 },
            { text: '-∞', pos: 100 },

        ]

        for (var i in ticks) {
            var tick = ticks[i]

            this.text({ text: tick.text, font: {family: 'Kanit', size: 10, color: 'grey'}, top: sk.utils.map(tick.pos, 0, 100, 0, this.rect.height-14)})
        }
    }
}
