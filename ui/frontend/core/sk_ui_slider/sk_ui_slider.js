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

        this.secondThumb = this.add.component(_c => {
            _c.classAdd('sk_ui_slider_thumb')
            _c.style.left = '0px'
            _c.style.display = 'none'
            _c.animate = false
        })


        var mouseUpHandler = async _e => {
            sk.interactions.unblock()
            
            this.mdPos = undefined
            this.bypassTween = false
            this.hasMoved = false
            this.__rangeDragOffset = undefined

            if (this.onChangedEnd) this.onChangedEnd(this.__rangeMode ? this.getRange() : this.value)
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

            if (this.__rangeMode) {
                var rangeMousePos = sk.interactions.getPos(_e)
                var rangePosition = !this.vertical
                    ? rangeMousePos.x - this.rect.left
                    : rangeMousePos.y - this.rect.top
                var rangeValue = this.positionToValue(!this.vertical
                    ? rangePosition - (this.__rangeDragOffset || 0)
                    : rangePosition - (this.__rangeDragOffset || 0))

                if (this.__rangeDragThumb === 'start') this.setRange(rangeValue, this.__rangeEnd)
                else this.setRange(this.__rangeStart, rangeValue)

                if (!this.__onChangeStart_notified && this.onChangedStart) this.onChangedStart(this.getRange())
                this.__onChangeStart_notified = true
                sk.interactions.block()
                return
            }


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

            var trackSize = this.getTrackSize()
            if (!this.vertical) {
                if (newPos.x > trackSize) newPos.x = trackSize
                var value = sk.utils.map(newPos.x, 0, trackSize, this.min, this.max)
            } else {
                if (newPos.y > trackSize) newPos.y = trackSize
                var value = sk.utils.map(newPos.y, 0, trackSize, this.min, this.max)
            }


            this.setValue(value)
            // Notify from user input only — never from setValue/tween/ResizeObserver (those corrupt params at width 0).
            if (this.onChanged) this.onChanged(this.__value)

            
            if (mouseDiff.x > 0 || mouseDiff.y > 0){
                if (!this.__onChangeStart_notified && this.onChangedStart) this.onChangedStart(value)
                this.__onChangeStart_notified = true
                sk.interactions.block()
            }
        }




        var handleMouseDown = async _e => {
            if (!_e.touches && _e.button !== 0) return

            this.hasMoved = false
            this.bypassTween = true

            _e.preventDefault()
            _e.stopPropagation()
            

            this.mdPos = sk.interactions.getPos(_e)

            if (this.__rangeMode) {
                var rangeMousePos = this.mdPos
                var rangePosition = !this.vertical
                    ? rangeMousePos.x - this.rect.left
                    : rangeMousePos.y - this.rect.top
                var thumbPositions = this.getRangeThumbPositions()
                this.__rangeDragThumb = Math.abs(rangePosition - thumbPositions.start) <= Math.abs(rangePosition - thumbPositions.end)
                    ? 'start'
                    : 'end'
                this.__rangeDragOffset = rangePosition - thumbPositions[this.__rangeDragThumb]
            }

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
            this.dawPluginParamIsTouching = true
            this.setValue(this.defaultValue)
            this.dawPluginParamIsTouching = true
            if (this.onChanged) this.onChanged(this.__value)

            if (this.onChangedEnd) this.onChangedEnd(this.value)
        })
        
        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'number', onSet: val => {
            this.setValue(val)
        }})

        this.attributes.add({friendlyName: 'Range', name: 'range', type: 'bool', onSet: val => {
            this.setRangeMode(val)
        }})
        this.attributes.add({friendlyName: 'Range Start', name: 'rangeStart', type: 'number', onSet: val => {
            this.__rangeStart = val
            if (this.__rangeMode) this.setRange(val, this.__rangeEnd)
        }})
        this.attributes.add({friendlyName: 'Range End', name: 'rangeEnd', type: 'number', onSet: val => {
            this.__rangeEnd = val
            if (this.__rangeMode) this.setRange(this.__rangeStart, val)
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
            easing: 'outQuint',
            onChanged: res => {
                if (this.bypassTween && this.smooth) return
                this.updatePos(res.current)
            }
        })


         if (opt.extraOpt){
            setTimeout(()=>{
                var initVals = opt.extraOpt || {}
                var hasInit = initVals.step !== undefined
                    || initVals.min !== undefined
                    || initVals.max !== undefined
                    || initVals.default !== undefined
                    || initVals.value !== undefined
                // add.slider(cb) still passes a truthy extraOpt {} — do not reset to min after 100ms.
                if (!hasInit) return
                if (initVals.step    !== undefined) this.step = initVals.step
                if (initVals.min     !== undefined) this.min = initVals.min
                if (initVals.max     !== undefined) this.max = initVals.max
                if (initVals.default !== undefined) this.defaultValue = initVals.default
                var wasBypass = this.bypassTween
                this.bypassTween = true
                if (initVals.value !== undefined) this.setValue(initVals.value)
                else if (initVals.default !== undefined) this.setValue(initVals.default)
                else if (this.__value === undefined) this.setValue(this.min)
                this.bypassTween = wasBypass
            }, 100)
        }

        this.observeLayout()
    }

    // Layout size (ignores CSS transform scale on ancestors — getBoundingClientRect does not).
    getTrackSize(){
        if (!this.vertical) return this.element.offsetWidth || 0
        return this.element.offsetHeight || 0
    }

    getThumbSize(){
        if (!this.thumb || !this.thumb.element) return 0
        if (!this.vertical) return this.thumb.element.offsetWidth || 0
        return this.thumb.element.offsetHeight || 0
    }

    getSliderMetrics(){
        var thumbSize = this.getThumbSize()
        var size = this.getTrackSize()
        var halfThumbSize = thumbSize / 2

        return {
            size,
            halfThumbSize,
            minPos: this.centerOrigin ? 0 : halfThumbSize,
            maxPos: size - (this.centerOrigin ? 0 : halfThumbSize)
        }
    }

    valueToPosition(value){
        var metrics = this.getSliderMetrics()
        return sk.utils.map(value, this.min, this.max, metrics.minPos, metrics.maxPos)
    }

    positionToValue(position){
        var metrics = this.getSliderMetrics()
        var clampedPosition = Math.max(metrics.minPos, Math.min(metrics.maxPos, position))
        return sk.utils.map(clampedPosition, metrics.minPos, metrics.maxPos, this.min, this.max)
    }

    normalizeRangeValue(value){
        var normalizedValue = Math.max(this.min, Math.min(this.max, Number(value)))
        if (!Number.isFinite(normalizedValue)) normalizedValue = this.min
        if (this.step && this.step > 0) {
            normalizedValue = this.min + Math.round((normalizedValue - this.min) / this.step) * this.step
        }
        return normalizedValue
    }

    setRangeMode(enabled){
        this.__rangeMode = !!enabled
        this.secondThumb.style.display = this.__rangeMode ? '' : 'none'
        this.thumb.classRemove('sk_ui_slider_thumb_rangeStart')
        this.secondThumb.classRemove('sk_ui_slider_thumb_rangeEnd')

        if (this.__rangeMode) {
            this.thumb.classAdd('sk_ui_slider_thumb_rangeStart')
            this.secondThumb.classAdd('sk_ui_slider_thumb_rangeEnd')
        }

        if (this.__rangeMode) {
            this.observeLayout()
            if (!Number.isFinite(this.__rangeStart)) this.__rangeStart = this.min
            if (!Number.isFinite(this.__rangeEnd)) this.__rangeEnd = this.max
            this.setRange(this.__rangeStart, this.__rangeEnd)
        } else {
            this.lineColorBar.style.left = '0px'
            this.setValue(this.__value === undefined ? this.min : this.__value)
        }
    }

    observeLayout(){
        if (this.__resizeObserver || typeof ResizeObserver === 'undefined') return

        this.__resizeObserver = new ResizeObserver(()=> {
            if (this.mdPos) return
            if (this.__rangeMode) {
                this.updateRangePositions(false)
                return
            }
            if (this.__value === undefined) return
            // Layout-only refresh must not notify — zero/transform sizes remap to min and corrupt params.
            var wasBypass = this.bypassTween
            var onChanged = this.onChanged
            this.onChanged = null
            this.bypassTween = true
            this.setValue(this.__value)
            this.bypassTween = wasBypass
            this.onChanged = onChanged
        })
        this.__resizeObserver.observe(this.element)
    }

    observeRangeLayout(){
        this.observeLayout()
    }

    setRange(start, end){
        if (!this.__rangeMode) return

        var normalizedStart = this.normalizeRangeValue(start)
        var normalizedEnd = this.normalizeRangeValue(end)
        if (normalizedStart > normalizedEnd) {
            if (this.__rangeDragThumb === 'start') normalizedStart = normalizedEnd
            else normalizedEnd = normalizedStart
        }

        this.__rangeStart = normalizedStart
        this.__rangeEnd = normalizedEnd
        this.updateRangePositions()
    }

    getRange(){
        return {
            min: this.__rangeStart,
            max: this.__rangeEnd
        }
    }

    getRangeThumbPositions(){
        var startPosition = this.valueToPosition(this.__rangeStart)
        var endPosition = this.valueToPosition(this.__rangeEnd)
        var metrics = this.getSliderMetrics()
        var halfThumbSize = metrics.halfThumbSize
        var thumbSize = halfThumbSize * 2
        var overlapOffset = Math.max(0, (thumbSize - (endPosition - startPosition)) / 2)
        var startOffset = Math.min(overlapOffset, startPosition - metrics.minPos)
        var endOffset = Math.min(overlapOffset, metrics.maxPos - endPosition)

        return {
            start: startPosition - startOffset,
            end: endPosition + endOffset,
            startPosition,
            endPosition,
            halfThumbSize
        }
    }

    updateRangePositions(notify = true){
        if (!this.__rangeMode) return

        var positions = this.getRangeThumbPositions()
        var positionProperty = !this.vertical ? 'left' : 'top'
        var sizeProperty = !this.vertical ? 'width' : 'height'

        this.thumb.style[positionProperty] = positions.start - positions.halfThumbSize + 'px'
        this.secondThumb.style[positionProperty] = positions.end - positions.halfThumbSize + 'px'
        this.lineColorBar.style[positionProperty] = positions.startPosition + 'px'
        this.lineColorBar.style[sizeProperty] = Math.max(0, positions.endPosition - positions.startPosition) + 'px'

        if (notify && this.onRangeChanged) this.onRangeChanged(this.getRange())
    }

    updatePos(pos){
        if (this.bypassTween){
            this.tween.last = pos
            this.tween.current = pos
            this.tween.target = pos
            this.tween._steps = 0
            if (typeof this.tween.stop === 'function') this.tween.stop()
        }

        this.thumb.style[(!this.vertical ? 'left' : 'top')] = pos - this.halfThumbSize + 'px'
        this.lineColorBar.style[(!this.vertical ? 'width' : 'height')] = pos + 'px'

        this.__lastPos = pos
    }

    setValue(val){
        var newVal = val
        if (newVal < this.min) newVal = this.min
        if (newVal > this.max) newVal = this.max

        this.__value = newVal

        this.halfThumbSize = this.getThumbSize() / 2
        var maxSize = this.getTrackSize()
        var minPos = (this.centerOrigin ? 0 : this.halfThumbSize)
        var maxPos = maxSize - (this.centerOrigin ? 0 : this.halfThumbSize)
        // Not laid out yet (or inverted) — keep __value; ResizeObserver will place the thumb later.
        if (!(maxSize > 0) || !(maxPos > minPos) || !Number.isFinite(minPos) || !Number.isFinite(maxPos)) return

        var mappedPos = sk.utils.map(newVal, this.min, this.max, minPos, maxPos)

        if (!this.smooth){
            var snapSize = maxSize / (this.max - this.min)
            mappedPos = this.thumb.movres_izer.calcSnap({
                gridSize      : snapSize,
                gridSnapWidth : snapSize/2,
                pos: mappedPos
            })

            if (this.__lastPos === mappedPos) return
        }


        if (mappedPos < minPos) mappedPos = minPos
        if (mappedPos > maxPos) mappedPos = maxPos

        if (!this.smooth){
            this.updatePos(mappedPos)
        } else {
            if (this.bypassTween && this.smooth) this.updatePos(mappedPos)
            else this.tween.to(mappedPos)
        }

        if (this.dawPluginParamIsTouching){
            if (this.__dawPluginWriteParamValue) this.__dawPluginWriteParamValue(this.__value)
        }
    }
}