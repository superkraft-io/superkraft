console.log('sk_ui_slider')

class sk_ui_slider extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.style.width = '100%'

        this.dawPluginParamType = 'slider'
        
        this.vertical = false
        this.compact = true

        this.pluginParamType = 'draggable'
        this.ownerHandlesDragAction = true
        
        var height = 12
        this.style.height = height*2

        this.style.position = 'relative'
        this.line = this.add.component(_c => {
            _c.classAdd('sk_ui_slider_line')
            
            this.lineColorBar = _c.add.component(_c => {
                _c.classAdd('sk_ui_slider_line_colorBar')
                _c.animate = false
            })
        })

        this.thumb = this.add.component(_c => {
            _c.classAdd('sk_ui_slider_thumb')
            _c.style.left = '0px'
            _c.animate = false
        })


        var mouseUpHandler = async _e => {
            sk.interactions.unblock()
            
            this.mdPos = undefined
            this.bypassTween = false
            this.hasMoved = false

            if (this.onChangedEnd) this.onChangedEnd(this.value)
            this.__onChangeStart_notified = false

            this.element.removeEventListener('mouseup', mouseUpHandler)
            this.element.removeEventListener('touchend', mouseUpHandler)
            
            this.element.removeEventListener('mousemove', mouseMoveHandler)
            this.element.removeEventListener('touchmove', mouseMoveHandler)
            
            document.removeEventListener('mousemove', mouseMoveHandler)
            document.removeEventListener('touchmove', mouseMoveHandler)

            document.removeEventListener('mouseup', mouseUpHandler)

        }

        var mouseMoveHandler = _e => {
            if (!this.mdPos) return


            _e.preventDefault()
            _e.stopPropagation()


            var mousePos = sk.interactions.getPos(_e)
            var mouseDiff = {
                x: this.mdPos.x - mousePos.x,
                y: this.mdPos.y - mousePos.y
            }


            
            var newPos = {
                x: this.originalPos.x - mouseDiff.x,
                y: this.originalPos.y - mouseDiff.y,
            }

            
            if (newPos.x < 0) newPos.x = 0
            if (newPos.y < 0) newPos.y = 0

            
            if (newPos.x > this.rect.width) newPos.x = this.rect.width
            if (newPos.y > this.rect.height) newPos.y = this.rect.height


            
            if (!this.vertical) var value = sk.utils.map(newPos.x, 0, this.rect.width, this.min, this.max)
            else var value = sk.utils.map(newPos.y, 0, this.rect.height, this.min, this.max)


            this.setValue(value)

            
            if (mouseDiff.x > 0 || mouseDiff.y > 0){
                if (!this.__onChangeStart_notified && this.onChangedStart) this.onChangedStart(value)
                this.__onChangeStart_notified = true
                sk.interactions.block()
            }
            
            if (this.onChanged) this.onChanged(this.__value)
        }




        var handleMouseDown = async _e => {
            if (_e.button !== 0) return

            this.hasMoved = false
            this.bypassTween = true

            _e.preventDefault()
            _e.stopPropagation()
            

            this.mdPos = sk.interactions.getPos(_e)

            this.originalPos = {
                x: this.lineColorBar.rect.width,
                y: this.lineColorBar.rect.height
            }


            
            this.element.addEventListener('mouseup', mouseUpHandler)
            this.element.addEventListener('touchend', mouseUpHandler)
            

            document.addEventListener('mouseup', mouseUpHandler)

            
            this.element.addEventListener('mousemove', mouseMoveHandler)
            this.element.addEventListener('touchmove', mouseMoveHandler)
            
            document.addEventListener('mousemove', mouseMoveHandler)
            document.addEventListener('touchmove', mouseMoveHandler)
        }

        this.element.addEventListener('mousedown', handleMouseDown)
        this.element.addEventListener('touchstart', handleMouseDown)

        this.element.addEventListener('dblclick', _e => {
            _e.preventDefault()
            _e.stopPropagation()

            if (this.__dawPluginParamCancelCheck){
                if (this.__dawPluginParamCancelCheck()) return
            }
            
            this.__value = this.defaultValue
            this.pluginParamIsTouching = true
            this.setValue(this.defaultValue)
            this.pluginParamIsTouching = true

            if (this.onChangedEnd) this.onChangedEnd(this.value)
        })
        
        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'number', onSet: val => {
            this.setValue(val)
        }})

        this.attributes.add({friendlyName: 'Step', name: 'step', type: 'number', onSet: val => {  }})
        this.attributes.add({friendlyName: 'Min', name: 'min', type: 'number', onSet: val => {  }})
        this.attributes.add({friendlyName: 'Max', name: 'max', type: 'number', onSet: val => {  }})
        this.attributes.add({friendlyName: 'Default Value', name: 'defaultValue', type: 'number'})

        this.attributes.add({friendlyName: 'Labeled', name: 'labeled', type: 'bool', onSet: val => { /*this.sliderBucket.sliderEl.classList.remove('labeled'); if (val) this.sliderBucket.sliderEl.classList.add('labeled');*/ }})
        this.attributes.add({friendlyName: 'Ticked', name: 'ticked', type: 'bool', onSet: val => { /*this.sliderBucket.sliderEl.classList.remove('ticked'); if (val) this.sliderBucket.sliderEl.classList.add('ticked');*/ }})
        this.attributes.add({friendlyName: 'Smooth', name: 'smooth', type: 'bool', onSet: val => {
            /*if (val){
                this.thumb.classAdd('sk_ui_slider_thumb_smooth')
                this.lineColorBar.classAdd('sk_ui_slider_line_colorBar_smooth')
            } else {
                this.thumb.classremove('sk_ui_slider_thumb_smooth')
                this.lineColorBar.classremove('sk_ui_slider_line_colorBar_smooth')
            }*/
        }})
        this.__smooth = true


        this.attributes.add({friendlyName: 'Thumbless', name: 'thumbless', type: 'bool', onSet: val => {
            this.thumb.style.display = (val ? 'none' : '')
        }})


        
        
        this.attributes.add({friendlyName: 'Labels', name: 'labels', type: 'text', onSet: val => {  }})

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'text', onSet: val => {
            //var colors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black']
            
            this.lineColorBar.style.backgroundColor = val
            return

            colors.forEach(_c => this.lineColorBar.classRemove(_c))
            this.lineColorBar.classAdd(val)
        }})

        this.attributes.add({friendlyName: 'Center Origin', name: 'centerOrigin', type: 'bool'})

       
        this.tween = new SK_Tween({
            speed: 20,
            onChanged: res => {
                if (this.bypassTween && this.smooth) return
                this.updatePos(res.current)
            }
        })


         if (opt.extraOpt){
            var initVals = opt.extraOpt
            if (initVals.step) this.step = initVals.step
            if (initVals.min) this.min = initVals.min
            if (initVals.max) this.max = initVals.max
            if (initVals.default) this.defaultValue = initVals.default
            if (initVals.value){
                this.value = initVals.value
            } else {
                if (initVals.default) this.value = initVals.default
                else this.value = this.min
            }
        }
    }

    updatePos(pos){
        if (this.bypassTween){
            this.tween.last = pos
            this.tween.current = pos
        }

        this.thumb.style[(!this.vertical ? 'left' : 'top')] = pos - this.halfThumbSize + 'px'
        this.lineColorBar.style[(!this.vertical ? 'width' : 'height')] = pos + 'px'

        if (this.onChanged) this.onChanged(pos)

        this.__lastPos = pos
    }

    setValue(val){
        var newVal = val
        if (newVal < this.min) newVal = this.min
        if (newVal > this.max) newVal = this.max

        this.__value = newVal


        var thumbRect = this.thumb.rect
        var thisRect = this.rect

        
        if (!this.vertical){
            this.halfThumbSize = thumbRect.width / 2
            var maxSize = thisRect.width
        } else {
            this.halfThumbSize = thumbRect.height / 2
            var maxSize = thisRect.height
        }

        var minPos = (this.centerOrigin ? 0 : this.halfThumbSize)
        var maxPos = maxSize - (this.centerOrigin ? 0 : this.halfThumbSize)
        var mappedPos = sk.utils.map(newVal, this.min, this.max, minPos, maxPos)

        


     

        if (!this.smooth){
            var snapSize = (!this.vertical ? this.rect.width : this.rect.height) / (this.max - this.min)
            mappedPos = this.thumb.movres_izer.calcSnap({
                gridSize      : snapSize,
                gridSnapWidth : snapSize/2,
                pos: mappedPos
            })

            if (this.__lastPos === mappedPos) return
        }


        if (mappedPos < minPos) mappedPos = minPos
        if (mappedPos > maxPos) mappedPos = maxPos

        newVal = sk.utils.map(mappedPos, 0 + this.halfThumbSize, this.rect.width - this.halfThumbSize, this.min, this.max)
        
        if (!this.smooth){
            this.updatePos(mappedPos)
        } else {
            if (this.bypassTween && this.smooth) this.updatePos(mappedPos)
            else this.tween.to(mappedPos)
        }

        if (this.pluginParamIsTouching){
            if (this.__dawPluginWriteParamValue) this.__dawPluginWriteParamValue(newVal)
        }
    }
}