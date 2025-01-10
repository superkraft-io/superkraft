class sk_ui_vstParamManager {
    constructor() {
        this.components = {}

        this.startReadMonitor()
    }

    add(vstParamID, component) {
        this.components[vstParamID] = component
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

class sk_ui_0_vst_param_component_root extends sk_ui_component {
    static configRootHandlers(target) {
        target.element.addEventListener('contextmenu', async _e => {
            _e.stopPropagation()
            _e.preventDefault()

            if (_e.button === 2) {
                try {
                    await sk.nativeActions.handleParamComponentMouseEvent({
                        vstParamID: target.__vstParamID,
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
            if (target.__sk_ui_vst_param_component_root_mouseUp) target.__sk_ui_vst_param_component_root_mouseUp(_e)

            _e.preventDefault()
            _e.stopPropagation()

            delete target.__sk_ui_vst_param_component_root_mdPos

            document.removeEventListener('mouseup', mouseUpHandler)

            await sk.nativeActions.handleParamComponentMouseEvent({ vstParamID: target.vstParamID, event: 'mouseup' })
        }

        target.element.addEventListener('mousedown', async _e => {

            if (_e.target.tagName.toLowerCase() !== 'input') {
                _e.preventDefault()
                _e.stopPropagation()
            }


            target.__sk_ui_vst_param_component_root_mdPos = sk.interactions.getPos(_e)

            document.addEventListener('mouseup', mouseUpHandler)

            if (target.__sk_ui_vst_param_component_root_mouseDown) target.__sk_ui_vst_param_component_root_mouseDown(_e)

            await sk.nativeActions.handleParamComponentMouseEvent({ vstParamID: target.vstParamID, event: 'mousedown' })
        })

        

        target.__writeValue = async (opt = {}) => {
            if (sk.vstParamMngr.onParameterWritten) sk.vstParamMngr.onParameterWritten(target, opt)

            try {
                var res = await sk.nativeActions.handleParamComponentMouseEvent({
                    ...{
                        vstParamID: target.__vstParamID,
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
            if (target.__rootBusyReading || !sk.acceptReadingParameters) return

            target.__rootBusyReading = true

            var res = await sk.nativeActions.handleParamComponentMouseEvent({
                ...{
                    vstParamID: target.__vstParamID,
                    event: 'read'
                },
                ...opt
            })
            if (sk.vstParamMngr.onParameterRead) sk.vstParamMngr.onParameterRead(target, opt, res)

            target.__rootBusyReading = false

            return res
        }

        Object.defineProperty(target, 'vstParamID', {
            set(val) {
                target.__vstParamID = val
                sk.vstParamMngr.add(val, target)
            },

            get() {
                return target.__vstParamID;
            }
        });
    }

    constructor(opt) {
        super(opt)

        sk_ui_vst_param_component_root.configRootHandlers(this)
    }
}