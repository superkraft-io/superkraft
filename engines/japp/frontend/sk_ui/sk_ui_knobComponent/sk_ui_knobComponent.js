class sk_ui_knobComponent extends sk_ui_component {
    constructor(opt) {
        super(opt)

        this.styling += ' fullheight'

        this.compact = true

        this.isBypassed = false

       
        this.bypassContainer = this.add.juce_param_component_clickable(_c => {
            _c.classAdd('sk_ui_knobComponent_bypassContainer')

            _c._icon.remove()
            _c.label.remove()

            _c.vertical = false

            _c.add.label(_c => {
                _c.text = 'BYPASS'
                _c.size = 12
                _c.weight = '400'
                _c.marginRight = 6
            })

            this.bypassLED = _c.add.led(_c => {
                _c.classAdd('sk_ui_knobComponent_bypassLED')
                _c.pointerEvents = 'none'
                _c.tabIndex = -1
            })

            _c.onClick = _e => {
                this.bypassed = !this.bypassed
                _c.ums.set('onBypassStates', { bypassed: this.bypassed, components: [this.componentID] })

                if (this.onBypassChanged) this.onBypassChanged(this.bypassed)
            }
        })

        this.knob = this.add.knob(_c => {
            _c.knobFaceImg.tabIndex = 101
        })


        this.leftLabel = this.add.label(_c => {
            _c.classAdd('sk_ui_knobComponent_leftLabel')

            _c.text = 'Left Label'
        })

        this.rightLabel = this.add.label(_c => {
            _c.classAdd('sk_ui_knobComponent_rightLabel')
            _c.text = 'Right Label'
        })

        this.bottomLabel = this.add.label(_c => {
            _c.classAdd('sk_ui_knobComponent_bottomLabel')
            _c.text = 'Bottom Label'
            _c.color = 'white'
        })
    }

    set bypassed(val) {
        this.isBypassed = val
        this.bypassLED.active = val

        if (this.bypassed) {
            this.knob.opacity = 0.3
            this.knob.pointerEvents = 'none'

        } else {
            this.knob.opacity = 1
            this.knob.pointerEvents = ''
        }
    }

    get bypassed() {
        return this.isBypassed
    }
}