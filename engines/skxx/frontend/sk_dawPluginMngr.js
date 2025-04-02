class sk_dawPluginMngr {
    constructor() {
        this.components = {}

        this.startReadMonitor()
    }

    add(pluginParamID, component) {
        this.components[pluginParamID] = component
        sk_dawPluginMngr.configRootEvents(component)
    }

    startReadMonitor() {
        var step = async _ts => {
            for (var i in this.components) {
                var component = this.components[i]
                component.dawPluginParamInfo.readValue()
            }

            window.requestAnimationFrame(step)
        }

        window.requestAnimationFrame(step)
    }



    static configRootEvents(target) {
        target.dawPluginParamInfo = {
            applyValue: ()=>{ target.dawPluginParamInfo.writeValue({ value: target.__value }) }
        }
        
        target.element.addEventListener('contextmenu', async _e => {
            if (target.disabled) return

            _e.stopPropagation()
            _e.preventDefault()

            if (_e.button === 2) {
                try {
                    await sk.nativeActions.handlePluginParamMouseEvent({
                        pluginParamID: target.__pluginParamID,
                        event: 'contextmenu',
                        left: _e.clientX,
                        top: _e.clientY,
                    })
                } catch (err) {
                    if (err.error) {
                        if (err.error === 'standalone_runtime') target.hint({ text: '⚠️ Native DAW context menus only work when the plugin is running inside a DAW', instaShow: true, position: 'top center' })
                        target.hint({ text: '' })
                    }
                }
            }
        })

        var mouseUpHandler = async _e => {
            if (target.disabled) return

            if (target.dawPluginParamInfo.onMouseUp) target.dawPluginParamInfo.onMouseUp(_e)

            _e.preventDefault()
            _e.stopPropagation()

            delete target.dawPluginParamInfo.mdPos

            document.removeEventListener('mouseup', mouseUpHandler)

            await sk.nativeActions.handlePluginParamMouseEvent({ pluginParamID: target.pluginParamID, event: 'mouseup' })
        }

        target.element.addEventListener('mousedown', async _e => {

            if (_e.target.tagName.toLowerCase() !== 'input') {
                _e.preventDefault()
                _e.stopPropagation()
            }


            target.dawPluginParamInfo.mdPos = sk.interactions.getPos(_e)

            document.addEventListener('mouseup', mouseUpHandler)

            if (target.dawPluginParamInfo.onMouseDown) target.dawPluginParamInfo.onMouseDown(_e)

            await sk.nativeActions.handlePluginParamMouseEvent({ pluginParamID: target.pluginParamID, event: 'mousedown' })
        })

        

        target.__pluginParam_writeValue = async (opt = {}) => {
            if (sk.pluginParamMngr.onParameterWritten) sk.pluginParamMngr.onParameterWritten(target, opt)

            try {
                var res = await sk.nativeActions.handlePluginParamMouseEvent({
                    ...{
                        pluginParamID: target.__pluginParamID,
                        event: 'write'
                    },
                    ...opt
                })
            } catch (err) {
                console.error(err)
            }

            return res
        }

        target.dawPluginParamInfo.readValue = async (opt = {}) => {
            console.log('reading value for ' + target.__pluginParamID)
                
            if (target.dawPluginParamInfo.busyReading || !sk.acceptReadingParameters) return

            target.dawPluginParamInfo.busyReading = true

            var res = await sk.nativeActions.handlePluginParamMouseEvent({
                ...{
                    pluginParamID: target.__pluginParamID,
                    event: 'read'
                },
                ...opt
            })
            if (sk.pluginParamMngr.onParameterRead) sk.pluginParamMngr.onParameterRead(target, opt, res)

            target.dawPluginParamInfo.busyReading = false

            return res
        }

        target.setValueFromExternalSource = value => {
            target.value = value
            target.dawPluginParamInfo.applyValue()
        }
    }


    static configDraggableEvents(target){
        if (!target.dawPluginParamInfo) sk_dawPluginMngr.configRootEvents(target)

        target.dawPluginParamInfo.dragSensitivity = 0.5

        target.dawPluginParamInfo.valueRange = { min: 0, max: 100 }
        target.dawPluginParamInfo.defaultValue = 0

        target.dawPluginParamInfo.invertY = true

        var mouseMoveHandler = async _e => {
            if (!target.dawPluginParamInfo.mdPos) return

            sk.interactions.block()

            _e.stopPropagation()
            _e.preventDefault()


            var pos = sk.interactions.getPos(_e)

            

            if (_e.shiftKey) {
                if (!target.shiftPressed) {
                    target.dawPluginParamInfo.shiftPressed = true
                    target.dawPluginParamInfo.mdPos = pos
                    target.dawPluginParamInfo.mdValue = target.value
                }
            } else {
                if (target.shiftPressed) {
                    target.dawPluginParamInfo.mdPos = pos
                    target.dawPluginParamInfo.mdValue = target.value
                    delete target.dawPluginParamInfo.shiftPressed
                }
            }

            var diff = {
                x: pos.x - target.dawPluginParamInfo.mdPos.x,
                y: pos.y - target.dawPluginParamInfo.mdPos.y
            }

            if (target.invertX) diff.x = 0 - diff.x
            if (target.invertY) diff.y = 0 - diff.y
            
            var newVal = diff.y * target.dawPluginParamInfo.dragSensitivity
            if (target.dawPluginParamInfo.shiftPressed) newVal = newVal * 0.2

            target.value = target.dawPluginParamInfo.mdValue + newVal
            
            target.dawPluginParamInfo.applyValue()
        }


        target.__sk_ui_plugin_param_component_root_mouseDownEvent = _e => {
            target.dawPluginParamInfo.last_mdValue = 0
            target.dawPluginParamInfo.mdValue = target.value

            target.dawPluginParamInfo.manuallyChanging = true

            document.addEventListener('mousemove', mouseMoveHandler)

            if (target.onMouseDown) target.onMouseDown()
        }

        target.__sk_ui_plugin_param_component_root_mouseUp = _e => {
            sk.interactions.unblock()

            delete target.dawPluginParamInfo.manuallyChanging
            document.removeEventListener('mousemove', mouseMoveHandler)

            if (target.onMouseUp) target.onMouseUp()
        }

        target.element.addEventListener('wheel', _e => {
            target.value += (sk.os === 'win' ? 0 - _e.deltaY : _e.deltaY) / (_e.shiftKey ? 100 : 10)
            target.dawPluginParamInfo.applyValue()
        })

        target.element.addEventListener('keydown', _e => {
            if (_e.code === 'ArrowUp' || _e.code === 'ArrowRight') target.value += (_e.shiftKey ? 1 : 5)
            else if (_e.code === 'ArrowDown' || _e.code === 'ArrowLeft') target.value -= (_e.shiftKey ? 1 : 5)
                target.dawPluginParamInfo.applyValue()
        })

        target.element.addEventListener('dblclick', _e => {
            _e.preventDefault()
            _e.stopPropagation()

            target.value = target.dawPluginParamInfo.defaultValue

        })


        target.dawPluginParamInfo.readValue_root = target.dawPluginParamInfo.readValue
        
        target.dawPluginParamInfo.readValue = async ()=>{
            if (target.manuallyChanging || target.__busyReading) return
    
            target.blockWrite = true
    
            var normalizedValue = Number((await target.dawPluginParamInfo.readValue_root()).value)
    
            if (target.dawPluginParamInfo.lastReadValue === normalizedValue) return
    
            target.dawPluginParamInfo.lastReadValue = normalizedValue
    
            target.value = sk.utils.map(normalizedValue, 0, 1, target.dawPluginParamInfo.valueRange.min, target.dawPluginParamInfo.valueRange.max)
    
            target.dawPluginParamInfo.blockWrite = false
        }
    }


    static configTogglableEvents(target){
        if (!target.dawPluginParamInfo) sk_dawPluginMngr.configRootEvents(target)
        

        target.dawPluginParamInfo.readValue_root = target.dawPluginParamInfo.readValue

        target.dawPluginParamInfo.readValue = async function(){
            if (target.busyReading) return
    
            var value = (await target.dawPluginParamInfo.readValue()).value
    
            try { value = value.toLowerCase() } catch (err) { }
    
            var normalizedValue = 0
    
            if ([1, '1', true, 'true'].includes(value)) normalizedValue = 1
    
            if (target.dawPluginParamInfo.lastReadValue === normalizedValue) return
    
            target.dawPluginParamInfo.lastReadValue = normalizedValue
    
    
            target.dawPluginParamInfo.changedFromRead = true
    
            target.value = normalizedValue

            target.dawPluginParamInfo.changedFromRead = false
        }
    
    
        _c.setValueFromExternalSource = function (value) {
            target.dawPluginParamInfo.changedFromRead = true
    
            target.value = normalizedValue
    
            target.dawPluginParamInfo.changedFromRead = false
            if (target.dawPluginParamInfo.onSetValueFromExternalSource) target.dawPluginParamInfo.onSetValueFromExternalSource(value)
        }
    }
}