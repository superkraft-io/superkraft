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

            // Snap to step on release when non-smooth.
            if (!this.__rangeMode && !this.smooth) {
                this.setValue(this.__value)
                if (this.onChanged) this.onChanged(this.__value)
            }

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

            // Absolute pointer → value (no relative origin). Avoids CSS/layout origin bugs.
            var value = this.pointerEventToValue(_e)
            if (value == null) return

            this.setValue(value)
            if (this.onChanged) this.onChanged(this.__value)

            if (!this.__onChangeStart_notified && this.onChangedStart) this.onChangedStart(this.__value)
            this.__onChangeStart_notified = true
            sk.interactions.block()
        }



        var handleMouseDown = async _e => {
            if (!_e.touches && _e.button !== 0) return

            this.hasMoved = false
            this.bypassTween = true
            if (this.tween) {
                this.tween.last = this.tween.current
                this.tween.target = this.tween.current
                this.tween._steps = 0
                if (typeof this.tween.stop === 'function') this.tween.stop()
            }

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
            } else {
                // Jump thumb to click/touch immediately.
                var downVal = this.pointerEventToValue(_e)
                if (downVal != null) {
                    this.setValue(downVal)
                    if (this.onChanged) this.onChanged(this.__value)
                }
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

        this.attributes.add({friendlyName: 'Labeled', name: 'labeled', type: 'bool', onSet: val => { }})
        this.attributes.add({friendlyName: 'Ticked', name: 'ticked', type: 'bool', onSet: val => { }})
        this.attributes.add({friendlyName: 'Smooth', name: 'smooth', type: 'bool', onSet: val => { }})
        this.__smooth = true


        this.attributes.add({friendlyName: 'Thumbless', name: 'thumbless', type: 'bool', onSet: val => {
            this.thumb.style.display = (val ? 'none' : '')
        }})


        
        
        this.attributes.add({friendlyName: 'Labels', name: 'labels', type: 'text', onSet: val => {  }})

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'text', onSet: val => {
            this.lineColorBar.style.backgroundColor = val
            return
        }})

        this.attributes.add({friendlyName: 'Center Origin', name: 'centerOrigin', type: 'bool'})

       
        this.tween = new SK_Tween({
            speed: 20,
            easing: 'outQuint',
            onChanged: res => {
                if (this.bypassTween) return
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

    /** Coerced numeric bounds — attribute/JSON values may be strings. */
    getBounds(){
        var min = Number(this.min)
        var max = Number(this.max)
        if (!Number.isFinite(min)) min = 0
        if (!Number.isFinite(max)) max = 1
        if (max < min) {
            var swap = min
            min = max
            max = swap
        }
        return {min, max}
    }

    /**
     * Map pointer to value from element box. Returns null if layout/bounds unusable.
     */
    pointerEventToValue(_e){
        var bounds = this.getBounds()
        if (bounds.max === bounds.min) return bounds.min

        var mousePos = sk.interactions.getPos(_e)
        var rect = this.element.getBoundingClientRect()
        var trackSize = !this.vertical ? rect.width : rect.height
        if (!(trackSize > 0)) {
            trackSize = this.getTrackSize()
        }
        if (!(trackSize > 0)) return null

        var pos = !this.vertical
            ? (mousePos.x - rect.left)
            : (mousePos.y - rect.top)
        if (pos < 0) pos = 0
        if (pos > trackSize) pos = trackSize

        var value = bounds.min + (pos / trackSize) * (bounds.max - bounds.min)
        if (!Number.isFinite(value)) return null
        return value
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
        var bounds = this.getBounds()

        return {
            size,
            halfThumbSize,
            minPos: this.centerOrigin ? 0 : halfThumbSize,
            maxPos: size - (this.centerOrigin ? 0 : halfThumbSize),
            min: bounds.min,
            max: bounds.max
        }
    }

    valueToPosition(value){
        var metrics = this.getSliderMetrics()
        return sk.utils.map(value, metrics.min, metrics.max, metrics.minPos, metrics.maxPos)
    }

    positionToValue(position){
        var metrics = this.getSliderMetrics()
        var clampedPosition = Math.max(metrics.minPos, Math.min(metrics.maxPos, position))
        return sk.utils.map(clampedPosition, metrics.minPos, metrics.maxPos, metrics.min, metrics.max)
    }

    normalizeRangeValue(value){
        var bounds = this.getBounds()
        var normalizedValue = Math.max(bounds.min, Math.min(bounds.max, Number(value)))
        if (!Number.isFinite(normalizedValue)) normalizedValue = bounds.min
        if (this.step && this.step > 0) {
            normalizedValue = bounds.min + Math.round((normalizedValue - bounds.min) / this.step) * this.step
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
            if (!Number.isFinite(this.__rangeStart)) this.__rangeStart = this.getBounds().min
            if (!Number.isFinite(this.__rangeEnd)) this.__rangeEnd = this.getBounds().max
            this.setRange(this.__rangeStart, this.__rangeEnd)
        } else {
            this.lineColorBar.style.left = '0px'
            this.setValue(this.__value === undefined ? this.getBounds().min : this.__value)
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
        if (!Number.isFinite(pos)) return

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

    snapValueToStep(val){
        var bounds = this.getBounds()
        var step = Number(this.step)
        if (!(step > 0)) step = 1
        var range = bounds.max - bounds.min
        if (!(range > 0)) return val
        var snapped = bounds.min + Math.round((val - bounds.min) / step) * step
        if (snapped < bounds.min) snapped = bounds.min
        if (snapped > bounds.max) snapped = bounds.max
        return snapped
    }

    setValue(val){
        var bounds = this.getBounds()
        var newVal = Number(val)
        if (!Number.isFinite(newVal)) return
        if (newVal < bounds.min) newVal = bounds.min
        if (newVal > bounds.max) newVal = bounds.max

        this.halfThumbSize = this.getThumbSize() / 2
        var maxSize = this.getTrackSize()
        if (!(maxSize > 0)) {
            var rect = this.element.getBoundingClientRect()
            maxSize = !this.vertical ? rect.width : rect.height
        }
        var minPos = (this.centerOrigin ? 0 : this.halfThumbSize)
        var maxPos = maxSize - (this.centerOrigin ? 0 : this.halfThumbSize)

        // Follow pointer while dragging; snap only when idle (non-smooth).
        var isDragging = !!(this.mdPos || this.bypassTween)
        if (!this.smooth && !isDragging) {
            newVal = this.snapValueToStep(newVal)
        }

        this.__value = newVal

        // Not laid out yet — keep __value; ResizeObserver will place the thumb later.
        if (!(maxSize > 0) || !(maxPos > minPos) || !Number.isFinite(minPos) || !Number.isFinite(maxPos)) return

        var mappedPos = bounds.max === bounds.min
            ? minPos
            : (minPos + ((newVal - bounds.min) / (bounds.max - bounds.min)) * (maxPos - minPos))

        if (!Number.isFinite(mappedPos)) return
        if (mappedPos < minPos) mappedPos = minPos
        if (mappedPos > maxPos) mappedPos = maxPos

        if (!this.smooth || this.bypassTween) {
            this.updatePos(mappedPos)
        } else {
            this.tween.to(mappedPos)
        }

        if (this.dawPluginParamIsTouching){
            if (this.__dawPluginWriteParamValue) this.__dawPluginWriteParamValue(this.__value)
        }
    }
}
