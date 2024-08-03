class sk_ui_juce_param_component_root extends sk_ui_component {
    static configRootHandlers(target) {
        target.element.addEventListener('contextmenu', async _e => {
            _e.stopPropagation()
            _e.preventDefault()

            if (_e.button === 2) {
                try {
                    await sk.nativeActions.handleParamComponentMouseEvent({
                        jcID: target.jcID,
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

            await sk.nativeActions.handleParamComponentMouseEvent({ jcID: target.jcID, event: 'mouseup' })
        }

        target.element.addEventListener('mousedown', async _e => {

            if (_e.target.tagName.toLowerCase() !== 'input') {
                _e.preventDefault()
                _e.stopPropagation()
            }


            target.__sk_ui_juce_param_component_root_mdPos = sk.interactions.getPos(_e)

            document.addEventListener('mouseup', mouseUpHandler)

            if (target.__sk_ui_juce_param_component_root_mouseDown) target.__sk_ui_juce_param_component_root_mouseDown(_e)

            await sk.nativeActions.handleParamComponentMouseEvent({ jcID: target.jcID, event: 'mousedown' })
        })
    }

    constructor(opt) {
        super(opt)

        sk_ui_juce_param_component_root.configRootHandlers(this)
    }
}