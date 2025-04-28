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
            //await sk.utils.sleep()
            
            for (var i in this.components) {
                var component = this.components[i]
                component.dawPluginParamInfo.readValue()
            }

            window.requestAnimationFrame(step)
        }

        window.requestAnimationFrame(step)
    }

    async readAllParameters(){
        var list = []

        for (var i in this.components){
            var component = list[i]
            var paramID = component.pluginParamID
            list.push(paramID)
        }

        try {
            var res = await sk.nativeActions.handlePluginParamMouseEvent({
                parameters: list
            })


        } catch(err) {
            var x = 0
        }
    }



    static configRootEvents(target) {
        target.dawPluginParamInfo = {
            applyValue: ()=>{
                target.dawPluginParamInfo.writeValue({ value: target.__value })
            }
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
            //console.log('mouseup', target.pluginParamID)


            target.dawPluginParamInfo.busyChanging = false

            if (target.disabled) return

            if (target.dawPluginParamInfo.onMouseUp) target.dawPluginParamInfo.onMouseUp(_e)

            _e.preventDefault()
            _e.stopPropagation()
            

            delete target.dawPluginParamInfo.mdPos

            document.removeEventListener('mouseup', mouseUpHandler)

            await sk.nativeActions.handlePluginParamMouseEvent({ pluginParamID: target.pluginParamID, event: 'mouseup' })
        }

        target.element.addEventListener('mousedown', async _e => {
            //console.log('mousedown', target.pluginParamID)


            target.dawPluginParamInfo.busyChanging = true

            if (_e.target.tagName.toLowerCase() !== 'input') {
                _e.preventDefault()
                _e.stopPropagation()
            }


            target.dawPluginParamInfo.mdPos = sk.interactions.getPos(_e)

            document.addEventListener('mouseup', mouseUpHandler)

            if (target.dawPluginParamInfo.onMouseDown) target.dawPluginParamInfo.onMouseDown(_e)

            await sk.nativeActions.handlePluginParamMouseEvent({ pluginParamID: target.pluginParamID, event: 'mousedown' })
        })

        

        target.dawPluginParamInfo.writeValue = async (opt = {}) => {
            if (target.dawPluginParamInfo.blockWrite) return;
            target.dawPluginParamInfo.blockWrite = true

            target.dawPluginParamInfo.busyWriting = true

            if (target.pluginParamValueType === 'binary'){
                var mappedValue = (opt.value === true ? 1 : 0)
                opt.value = mappedValue
            }

            if (sk.dawPluginMngr.onParameterWritten) sk.dawPluginMngr.onParameterWritten(target, opt)

            try {
                //console.log(opt.value)
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


            target.dawPluginParamInfo.busyWriting = false

           
            target.dawPluginParamInfo.blockWrite = false

            return res
        }

        target.dawPluginParamInfo.readValue = async (opt = {}) => {
            if (target.dawPluginParamInfo.busyWriting || target.dawPluginParamInfo.busyChanging) return
            
            //console.log('reading value for ' + target.__pluginParamID)
                
            if (target.dawPluginParamInfo.busyReading) return

            target.dawPluginParamInfo.busyReading = true

            try {
                var res = await sk.nativeActions.handlePluginParamMouseEvent({
                    ...{
                        pluginParamID: target.__pluginParamID,
                        event: 'read'
                    },
                    ...opt
                })

                if (target.pluginParamValueType === 'binary'){
                    var mappedValue = (res.value === 1 ? true : false)
                    res.value = mappedValue
                }

                if (!target.dawPluginParamInfo.busyWriting || !target.dawPluginParamInfo.busyChanging){
                    if (sk.dawPluginMngr.onParameterRead) sk.dawPluginMngr.onParameterRead(target, opt, res)

                    var hasSetter = Object.getOwnPropertyDescriptor(target, 'value')['set']
                    if (hasSetter){
                        if (target.value !== res.value) target.value = res.value
                    } else {
                        if (!target.dawPluginParamInfo.noValueSetterNotified){
                            target.dawPluginParamInfo.noValueSetterNotified = true
                            console.error('[SK DAW Plugin Parameter - ERROR] No setter named "value" for the SK UI component that represents the parameter ID "' + target.__pluginParamID + '"')
                        }
                    }
                }
            } catch(err) {
                var x = 0
            }

            target.dawPluginParamInfo.busyReading = false

            return res
        }

        /*target.setValueFromExternalSource = value => {
            target.value = value
            target.dawPluginParamInfo.applyValue()
        }*/
    }


    static configDraggableEvents(target){
        if (!target.dawPluginParamInfo) sk_dawPluginMngr.configRootEvents(target)

        target.dawPluginParamInfo.dragSensitivity = 0.5

        target.dawPluginParamInfo.valueRange = { min: 0, max: 100 }
        target.dawPluginParamInfo.defaultValue = 0

        target.dawPluginParamInfo.invertY = true

        var mouseMoveHandler = async _e => {
            if (!target.dawPluginParamInfo.mdPos || target.ownerHandlesDragAction) return

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


        target.dawPluginParamInfo.__draggable_mouseDownHandler = _e => {
            //console.log('mousedown DRAGGABLE')

            target.dawPluginParamInfo.last_mdValue = 0
            target.dawPluginParamInfo.mdValue = target.value

            target.dawPluginParamInfo.manuallyChanging = true

            document.addEventListener('mousemove', mouseMoveHandler)

            if (target.onMouseDown) target.onMouseDown()
        }

        target.dawPluginParamInfo.__draggable_mouseUpHandler = _e => {
            //console.log('mouseup DRAGGABLE')

            sk.interactions.unblock()

            delete target.dawPluginParamInfo.manuallyChanging
            document.removeEventListener('mousemove', mouseMoveHandler)

            if (target.onMouseUp) target.onMouseUp()
        }

        target.element.addEventListener('mousedown', target.dawPluginParamInfo.__draggable_mouseDownHandler)
        document.addEventListener('mouseup', target.dawPluginParamInfo.__draggable_mouseUpHandler)

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
            if (target.dawPluginParamInfo.manuallyChanging || target.dawPluginParamInfo.busyReading){
                //console.log('BLOCKED READING')
                return
            }
    

            //console.log('target.dawPluginParamInfo.manuallyChanging = ' + target.dawPluginParamInfo.manuallyChanging)
            //console.log('target.dawPluginParamInfo.busyReading = ' + target.dawPluginParamInfo.busyReading)

            target.dawPluginParamInfo.blockWrite = true
    
            var value = Number((await target.dawPluginParamInfo.readValue_root()).value)
    
            target.dawPluginParamInfo.busyReading = true

            if (target.dawPluginParamInfo.lastReadValue !== value){
                target.dawPluginParamInfo.lastReadValue = value
                target.value = value
            }
            
            target.dawPluginParamInfo.blockWrite = false
            target.dawPluginParamInfo.busyReading = false
        }
    }


    static configTogglableEvents(target){
        return

        if (!target.dawPluginParamInfo) sk_dawPluginMngr.configRootEvents(target)
        

        target.dawPluginParamInfo.readValue_root = target.dawPluginParamInfo.readValue

        target.dawPluginParamInfo.readValue = async function(){
            if (target.dawPluginParamInfo.busyReading) return
    
            var value = (await target.dawPluginParamInfo.readValue_root()).value
    
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