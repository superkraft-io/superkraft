class sk_ui_juceParamManager {
    constructor() {
        this.components = {}

        this.startReadMonitor()
    }

    add(juceParamID, component) {
        this.components[juceParamID] = component
    }

    startReadMonitor() {

        var step = async _ts => {
            for (var i in this.components) {
                var component = this.components[i]
                if (!component.busyReading) await component.readValue()
            }

            window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)
    }
}

class sk_ui_juce_param_component_root extends sk_ui_component {
    static configRootHandlers(target) {
        target.element.addEventListener('contextmenu', async _e => {
            _e.stopPropagation()
            _e.preventDefault()

            if (_e.button === 2) {
                try {
                    await sk.nativeActions.handleParamComponentMouseEvent({
                        juceParamID: target.__juceParamID,
                        event: 'contextmenu',
                        left: _e.clientX,
                        top: _e.clientY,
                    })
                } catch (err) {
                    if (err.error) {
                        if (err.error === 'standalone_runtime') target.hint({ text: '⚠️ Native context menus only work when VST runs inside a DAW', instaShow: true, position: 'top center' })
                        target.hint({ text: '' })
                    }
                }
            }
        })

        var mouseUpHandler = async _e => {
            if (target.__sk_ui_juce_param_component_root_mouseUp) target.__sk_ui_juce_param_component_root_mouseUp(_e)

            _e.preventDefault()
            _e.stopPropagation()

            delete target.__sk_ui_juce_param_component_root_mdPos

            document.removeEventListener('mouseup', mouseUpHandler)

            await sk.nativeActions.handleParamComponentMouseEvent({ juceParamID: target.juceParamID, event: 'mouseup' })
        }

        target.element.addEventListener('mousedown', async _e => {

            if (_e.target.tagName.toLowerCase() !== 'input') {
                _e.preventDefault()
                _e.stopPropagation()
            }


            target.__sk_ui_juce_param_component_root_mdPos = sk.interactions.getPos(_e)

            document.addEventListener('mouseup', mouseUpHandler)

            if (target.__sk_ui_juce_param_component_root_mouseDown) target.__sk_ui_juce_param_component_root_mouseDown(_e)

            await sk.nativeActions.handleParamComponentMouseEvent({ juceParamID: target.juceParamID, event: 'mousedown' })
        })
    }

    constructor(opt) {
        super(opt)

        if (!sk.juceParamMngr) sk.juceParamMngr = new sk_ui_juceParamManager()

        sk_ui_juce_param_component_root.configRootHandlers(this)
    }

    set juceParamID(val) {
        this.__juceParamID = val
        sk.juceParamMngr.add(val, this)
    }


    async writeValue() {
        await sk.nativeActions.handleParamComponentMouseEvent({
            juceParamID: this.__juceParamID,
            event: 'write',
            value: sk.utils.map(this.value, this.valueRange.min, this.valueRange.max, 0, 1)
        })
    }

    async __writeValue(opt = {}) {
        var res = await sk.nativeActions.handleParamComponentMouseEvent({
            ...{
                juceParamID: this.__juceParamID,
                event: 'write'
            },
            ...opt
        })

        return res
    }

    async __readValue(opt = {}) {
        if (this.__busyReading) return

        this.__busyReading = true

        var res = await sk.nativeActions.handleParamComponentMouseEvent({
            ...{
                juceParamID: this.__juceParamID,
                event: 'read'
            },

            ...opt
        })

        this.__busyReading = false

        return res
    }
}