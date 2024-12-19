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
                if (component.readValue) component.readValue()
                else component.__readValue()
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

        

        target.__writeValue = async (opt = {}) => {
            if (sk.juceParamMngr.onParameterWritten) sk.juceParamMngr.onParameterWritten(target, opt)

            try {
                var res = await sk.nativeActions.handleParamComponentMouseEvent({
                    ...{
                        juceParamID: target.__juceParamID,
                        event: 'write'
                    },
                    ...opt
                })
            } catch (err) {
                console.error(err)
            }

            return res
        }

        target.__readValue = async (opt = {}) => {
            var res = await sk.nativeActions.handleParamComponentMouseEvent({
                ...{
                    juceParamID: target.__juceParamID,
                    event: 'read'
                },
                ...opt
            })
            if (sk.juceParamMngr.onParameterRead) sk.juceParamMngr.onParameterRead(target, opt, res)

            return res
        }

        Object.defineProperty(target, 'juceParamID', {
            set(val) {
                target.__juceParamID = val
                sk.juceParamMngr.add(val, target)
            },

            get() {
                return target.__juceParamID;
            }
        });
    }

    constructor(opt) {
        super(opt)

        sk_ui_juce_param_component_root.configRootHandlers(this)
    }
}