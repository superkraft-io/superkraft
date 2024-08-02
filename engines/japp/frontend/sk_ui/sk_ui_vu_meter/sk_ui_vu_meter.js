class sk_ui_vu_meter extends sk_ui_component {
    constructor(opt) {
        super(opt)

        this.infoHint = { icon: 'volume up', text: 'Gain' }

        this.styling += ' fullheight'
        this.vertical = false


        this.leftSignal = this.add.fromNew(sk_ui_vu_meter_signal, _c => {
            _c.jcID = 'Input Volume'

            _c.label.text = 'INPUT'

            _c.gainSlider.onMouseDown = async val => {
                await sk.nativeActions.writeParams({ componentID: 'volume', parameterID: 'in', mouse_state: 'down' })
            }

            _c.gainSlider.onMouseUp = async val => {
                await sk.nativeActions.writeParams({ componentID: 'volume', parameterID: 'in', mouse_state: 'up' })
            }

            _c.gainSlider.onChanged = async val => {
                await sk.nativeActions.writeParams({ inputVolume: val })
            }
        })

        this.add.fromNew(sk_ui_vu_meter_dbLabels)
        
        this.rightSignal = this.add.fromNew(sk_ui_vu_meter_signal, _c => {
            _c.jcID = 'Output Volume'

            _c.label.text = 'OUTPUT'
            _c.gainSlider.cursorSide = 'right'

            _c.gainSlider.onMouseDown = async val => {
                await sk.nativeActions.writeParams({ componentID: 'volume', parameterID: 'out', mouse_state: 'down' })
            }

            _c.gainSlider.onMouseUp = async val => {
                await sk.nativeActions.writeParams({ componentID: 'volume', parameterID: 'out', mouse_state: 'up' })
            }

            _c.gainSlider.onChanged = async val => {
                await sk.nativeActions.writeParams({ outputVolume: val })
            }
        })
    }
}

class sk_ui_vu_meter_signal extends sk_ui_juce_param_component_root {
    constructor(opt) {
        super(opt)

        this.channels = {}

        this.add.component(_c => {
            var meter = _c
            _c.style.position = 'relative'

            _c.styling += ' fullheight'

            _c.width = 52

            _c.vertical = false
            _c.compact = true

            this.channels.left = _c.add.fromNew(sk_ui_vu_meter_signal_channel, _c => {
                _c.marginRight = 4
            })

            this.channels.right = _c.add.fromNew(sk_ui_vu_meter_signal_channel)

            this.gainSlider = _c.add.fromNew(sk_ui_vu_meter_gain_slider, _c => {

            })
        })

        this.label = this.add.label(_c => {
            _c.text = 'SIGNAL'
        })


        this.element.addEventListener('mousewheel', _e => {
            return
            this.gainSlider.gain += _e.deltaY / 10
            this.gainSlider.gain += _e.deltaY / 10
        })
    }    
}

class sk_ui_vu_meter_gain_slider extends sk_ui_component {
    constructor(opt){
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

                this.cursorLabel = _c.add.label(_c => {
                    _c.classAdd('sk_ui_vu_meter_signal_cursor_pointer_label')
                    _c.text = '100%'
                })
            })

            _c.movable = 'y'

            const resizeObserver = new ResizeObserver((entries) => {
                _c.movres_izer.mover.constraints.y.max = this.rect.height
            })

            resizeObserver.observe(this.element)

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

        this.cursorTweener = new SK_Tween({
            speed: 20,
            onChanged: res => {
                this.updateGainUI(res.current)
            }
        })
        this.cursorTweener.current = 100
        this.cursorTweener.target = 100
    }

    updateGainUI(gainVal) {
        var posY = this.mapGainToPx(gainVal)
        this.cursor.style.top = posY + 'px'
        this.cursorLabel.text = gainVal.toFixed(0) + '%'

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
        var target = val
        if (target < 0) target = 0
        if (target > 150) target = 150;

        if (this.instantPosition) {
            this.cursorTweener.target = target
            this.cursorTweener.current = target
            this.updateGainUI(target)
        } else {
            this.cursorTweener.to(target)
        }
    }

    get gain() {
        return this.cursorTweener.current
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

        this.__value = 0

        setInterval(() => {
            this.value += 10
            if (this.value > 100) this.value = 0
        }, 500)
    }

    set value(val) {
        this.__value = val
        this.highlight.style.maskImage = `linear-gradient(to bottom, transparent, transparent ${100 - val}%, white ${100 - val}%, white)`
    }

    get value() {
        return this.__value
    }
}


class sk_ui_vu_meter_dbLabels extends sk_ui_canvas {
    constructor(opt) {
        super(opt)

        this.styling += ' fullheight'

        this.update()
    }

    onResize(){

    }
}
