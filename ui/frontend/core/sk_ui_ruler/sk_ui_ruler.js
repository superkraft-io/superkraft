class sk_ui_ruler extends sk_ui_canvas {
    //class sk_ui_ruler extends sk_ui_wE_pixi_canvas {
    constructor(opt){
        super(opt)


        this.classAdd('sk_ui_wE_view_rightSide_palette_ruler_canvas')
        this.manualUpdate = true

        /*
        this.canvas = this.add.canvas(_c => {
            _c.classAdd('sk_ui_wE_view_rightSide_palette_ruler_canvas')
            _c.manualUpdate = true
            _c.animate = false
        })*/



        this.styling += ' fullwidth'
        //this.resizable = 'y'
        //this.height = 512
        this.width = 16

        this.constraints = {
            decimals: 2,
            tickDistance: {
                max: 14
            },

            value: {
                min: Infinity,
                max: Infinity
            }
        }

        this.tween_zoom = new SK_Tween({
            autoStep: true,
            speed: 50,
            onChanged: res => {
                this.setDirty()
            }
        })
        this.tween_zoom.target = 1
        this.tween_zoom.current = 1


        this.tween_scroll = new SK_Tween({
            autoStep: true,
            speed: 50,
            onChanged: res => {
                this.setDirty()
            }
        })



        this.dbgOffset = 0//Math.round(256 - 64)
        this.dbgViewSize = 0//128


        this.movres_izer.resizer.onResizing = ()=>{
            //this.setDirty()
        }




        this.placeHolderSegment = new sk_ui_ruler_segment({
            canvas: this
        })

        






        var observer = new ResizeObserver(()=>{
            this.getMinZoom()
            this.getMaxZoom()
            this.setDirty()
        }).observe(this.element)





        var handleDblClick = _e => {
            this.resetToDefault()
        }



        this.element.addEventListener('mousemove', _e => {
            if (this.mdPos) return
            
        

            this.moPos = sk.interactions.getPos(_e)
            this.moPosLocal = sk.interactions.getPos(_e, true, this.rect)

            this.originalZoom   = this.zoomTarget
            this.originalScroll = this.scrollTarget

            this.originalHeight = this.getVirtualSize()
            //console.log('this.originalHeight: ' + this.originalHeight)

        })

        
        this.element.addEventListener('mousewheel', _e => {
            if (_e.deltaX) return

            
            _e.preventDefault()
            _e.stopPropagation()

            if (_e.ctrlKey){
                this.scroll -= _e.deltaY / 2
                return
            }    

            var mousePos = sk.interactions.getPos(_e, true, this.rect)
            this.zoomInCenteredOnPoint(mousePos.y, (_e.deltaY  < 0 ? 0.9 : 1.1))
        })




        this.element.addEventListener('mousedown', _e => {
            if (this.dblClickTimer){
                clearTimeout(this.dblClickTimer)
                delete this.dblClickTimer

                handleDblClick()

                return
            }
            clearTimeout(this.dblClickTimer)
            this.dblClickTimer = setTimeout(()=>{
                clearTimeout(this.dblClickTimer)
                delete this.dblClickTimer
            }, 250)

            /*******/

            this.mdPos = sk.interactions.getPos(_e, true, this.rect)
            this.originalScroll = this.scroll
            this.autoScrollOffset = 0

            sk.interactions.block()

            document.addEventListener('mouseup', this.handleMouseUp)
            document.addEventListener('mousemove', this.handleMouseMove)
        })

        this.handleMouseUp = _e => {
            clearInterval(this.autoScroll_timer)
            delete this.autoScroll_timer

            if (!this.moPos){
                //if (_e.button === 0) this.zoomToRange(2, 5)
                //if (_e.button === 1) this.zoomToRange(2.435, 2.787)
                //if (_e.button === 2) this.scrollToValue(3, true)
                
            }

            document.removeEventListener('mouseup', this.handleMouseUp)
            document.removeEventListener('mousemove', this.handleMouseMove)

            delete this.mdPos
            delete this.moPos
            
            sk.interactions.unblock()
        }

        this.handleMouseMove = _e => {
            this.moPos = sk.interactions.getPos(_e, true, this.rect)

            var mDiff = {
                x: this.moPos.x - this.mdPos.x,
                y: this.moPos.y - this.mdPos.y
            }

            //if (mDiff.x === 0) mDiff.x = 1
            //var zoomFactor = 1 + (mDiff.x / 100)
            //this.zoomInCenteredOnPoint(this.moPos.y, zoomFactor)

            //return

            if (!this.mdPos) return
            
            this.moDiffPos = {
                x: this.moPos.x - this.mdPos.x,
                y: this.moPos.y - this.mdPos.y
            }

            if (!this.autoScroll_timer){
                this.scroll = this.originalScroll + this.moDiffPos.y + this.autoScrollOffset
            }

            var autoScroll = false
            if (this.moPos.y < 0) autoScroll = '-'
            if (this.moPos.y > this.rect.height) autoScroll = '+'

            if (this.moPos.y >= 0 && this.moPos.y <= this.rect.height){
                clearInterval(this.autoScroll_timer)
                delete this.autoScroll_timer
            }


            
            

            if (autoScroll){
                this.autoScrollSpeed = 1
                
                if (autoScroll === '-') this.autoScrollSpeed = sk.utils.map(this.moPos.y, 0, -100, 1, 15) / 2
                else this.autoScrollSpeed = sk.utils.map(this.moPos.y, this.rect.height, this.rect.height + 100, 1, 15) / 2

                //console.log(this.autoScrollSpeed)

                if (!this.autoScroll_timer){
                    this.autoScroll_timer = setInterval(()=>{
                        if (autoScroll === '-') this.autoScrollOffset -= this.autoScrollSpeed
                        else this.autoScrollOffset += this.autoScrollSpeed
                        
                        this.scroll = this.originalScroll + this.autoScrollOffset

                        //console.log(this.originalScroll)
                        //this.autoScrollOffset = this.scroll - this.originalScroll
                        //if (this.autoScrollOffset < 0) this.autoScrollOffset = 0-this.autoScrollOffset
                    }, 10)
                }
            }

            this.setDirty()
        }

        //this.oppositeSide = true
        //this.reverse = true


        this.ums.on('sk_ui_tween_step', ()=>{
            this.updateRuler()
        })
    }

    setDirty(){ this.__dirty = true }

    init(opt = {}){
        this.initialValues = opt

        //this.init() //use with sk_ui_wE_pixi_canvas
        this.getMaxZoom()
        this.getMinZoom()

        
        /*****/

        this.instantZoom = true
        this.instantScroll = true

        

        if (opt.start !== undefined && opt.end !== undefined){
            this.zoomToRange(opt.start, opt.end)
        } else {
            var startPx = this.map.valToPx(this.constraints.value.min)
            var endPx = this.map.valToPx(this.constraints.value.max)
            var start = (this.constraints.value.min === Infinity || this.constraints.value.min === undefined ? 0 : this.constraints.value.min)
            var end = (this.constraints.value.max === Infinity || this.constraints.value.max === undefined ? 30 : this.constraints.value.max)
            if (startPx > 0 || endPx < this.rect.height) this.zoomToRange(start, end)
        }
        this.instantZoom = false
        this.instantScroll = false

        /*****/
    }

    getMaxZoom(){
        var maxZoom = this.constraints.tickDistance.max / (this.placeHolderSegment.segmentArea / Math.pow(10, this.constraints.decimals))
        this.maxZoom = maxZoom
        return maxZoom
    }

    getMinZoom(){
        var maxValPx = this.map.valToPx(this.constraints.value.max - this.constraints.value.min, true, true)
        //console.log('maxValPx: ' + maxValPx)
        
        //console.log('this.rect.height: ' + this.rect.height)

        var minZoom = this.rect.height / maxValPx
        //console.log('minZoom: ' + minZoom)

        this.minZoom = minZoom

        return minZoom
    }

    set zoom(val){
        if (val >= this.maxZoom) val = this.maxZoom
        if (val <= this.minZoom) val = this.minZoom

        if (this.instantZoom){
            this.tween_zoom.target = val
            this.tween_zoom.current = val
            this.setDirty()
            return
        }

        this.tween_zoom.to(val)
    }
    get zoom(){ return this.tween_zoom.current }
    get zoomTarget(){ return this.tween_zoom.target }


    set scroll(val){
        
        if (this.constraints.value.min !== undefined && this.constraints.value.min !== Infinity){
            var clampMinPos = 0-this.map.valToPx(this.constraints.value.min, true)
            if (val > clampMinPos) val = clampMinPos
        }

        
        if (this.constraints.value.max !== undefined && this.constraints.value.max !== Infinity){
            var maxPx = this.map.valToPx(this.constraints.value.max, true, false, true)
            if (maxPx > this.rect.height){
                var clampMaxPos = 0-(maxPx - this.rect.height)
                //console.log('clampMaxPos: ' + clampMaxPos)
                if (val < clampMaxPos) val = clampMaxPos
            }
        }


        if (this.instantScroll){
            this.tween_scroll.target = val
            this.tween_scroll.current = val
            this.setDirty()
            return
        }

        this.tween_scroll.to(val)
    }
    get scroll(){ return this.tween_scroll.current }
    get scrollTarget(){ return this.tween_scroll.target }


    set orientation(val){
        this.__orientation = val
        this.setDirty()
    }
    get orientation(){ return this.__orientation }

    set oppositeSide(val){
        this.__oppositeSide = val
        this.setDirty()
    }
    get oppositeSide(){ return this.__oppositeSide }



    
    /**********/

    getVirtualSize(future){
        return this.getRangeInPx(future).range
    }

    /*get virtualZoom(){
        var rangeRes = this.getRangeInPx()
        var vZoom = this.rect.height / rangeRes.range
        return vZoom
    }*/

    getRangeInPx(future){
        var res = {
            start: this.map.valToPx(this.constraints.value.min || 0, false, false, future),
            end: this.map.valToPx(this.constraints.value.max || 0, false, false, future)
        }

        res.range = res.end - res.start

        return res
    }

    getRangeAsValue(){
        var res = {
            start: this.map.pxToVal(0),
            end: this.map.pxToVal(this.rect.height)
        }

        res.range = res.end - res.start

        return res
    }

    get map(){
        var _this = this

        return {
            valToPx(val, ignoreScroll, ignoreZoom, future){
                var scrollVal = _this.scroll
                if (ignoreScroll) scrollVal = 0
                
                var zoomVal = (!future ? _this.zoom : _this.zoomTarget)
                if (ignoreZoom) zoomVal = 1

                var res = (_this.placeHolderSegment.labelArea * val) * zoomVal

                res -= scrollVal

                //if (this.reverse) res = 0-res

                return res
            },

            pxToVal(px, ignoreScroll){
                var scrollVal = _this.scroll
                if (ignoreScroll) scrollVal = 0
                var val = (px - scrollVal) / (_this.placeHolderSegment.labelArea * _this.zoom)

                //if (this.reverse) val = 0-val

                return val
            }
        }
    }

    scrollToValue(val, centered, offset = 0){
        var pxStart = this.map.valToPx(val)
        var newScrollPos = pxStart
        if (centered) newScrollPos -= this.rect.height / 2
        
        this.scroll = 0-(newScrollPos + offset)
    }

    zoomToRange(start, end, offset = 0){
        
        //--> this.zoomToRange(2, 5)

        var pxStart = this.placeHolderSegment.labelArea * start
        var pxEnd = this.placeHolderSegment.labelArea * end

        var pxDiff = pxEnd - pxStart

        var newZoom = this.rect.height / pxDiff

        this.zoom = newZoom


        var newScrollPos = 0-(pxStart * newZoom) + offset
        this.scroll = newScrollPos
    }



    zoomInCenteredOnPoint = (pxOffset = 0, zoomFactor = 1)=>{
        var halfSize = this.rect.height / 2


        var rangeRes = this.getRangeAsValue()
        var targetRangeHalf = (rangeRes.range * zoomFactor) / 2
        

        var midPointVal = this.map.pxToVal(halfSize)
        

        var newRange = {
            start: midPointVal - targetRangeHalf,
                end: midPointVal + targetRangeHalf
        }


        var offsetFromMid = pxOffset - halfSize

        var valFuturePos = offsetFromMid / zoomFactor

        var deltaFuturePos = offsetFromMid - valFuturePos

        this.zoomToRange(newRange.start, newRange.end, deltaFuturePos)
    }


    resetToDefault(){
        this.zoomToRange(this.initialValues.start, this.initialValues.end)
    }

    
    /**************/


    updateRuler(){
        if (!this.__dirty) return
        this.__dirty = false

        this.update()
        this.clear()

        //this.line({color: 'green', from: {x: 0, y: this.dbgOffset}, to: {x: this.rect.width, y: this.dbgOffset}})
        //this.line({color: 'red', from: {x: 0, y: this.dbgOffset + this.dbgViewSize}, to: {x: this.rect.width, y: this.dbgOffset + this.dbgViewSize}})

        this.plot()

        this.busy = false

        if (this.onChanged) this.onChanged(this.getRangeAsValue())
    }

    plot(){
        //console.log('===============')
        //console.log('zoom: ' + this.zoom)

        var newSize = (this.zoom < 1 ? this.placeHolderSegment.segmentArea / this.zoom : this.placeHolderSegment.segmentArea * this.zoom)
        //console.log('newSize: ' + newSize)

        var wrapRes = sk.utils.wrapNum(this.placeHolderSegment.segmentArea, newSize, true)

        var wrapCount = wrapRes.wrapCount - 1
        if (this.zoom < 1) wrapCount = 0-wrapCount
        //console.log('wrapCount: ' + wrapCount)
        //console.log('wrappedSize: ' + wrappedSize)

        this.placeHolderSegment.realSize = this.placeHolderSegment.segmentArea * this.zoom
        //this.placeHolderSegment.plot()


        var rect = this.rect
        

        var rangeInPx = this.getRangeInPx()
        //console.log(rangeInPx)

        if (this.minZoom > this.zoom){
            this.instantZoom = true
            this.instantScroll = true

            this.zoom = this.minZoom
            this.scroll = 0-rangeInPx.start
            
            this.instantZoom = false
            this.instantScroll = false
        }
        
        var boundMinMax = {
            min: this.map.pxToVal(0),
            max: this.map.pxToVal(rect.height)
        }
        
        
        if (boundMinMax.min < this.constraints.value.min){
            this.instantZoom = true
            this.instantScroll = true
            this.zoomToRange(this.constraints.value.min, boundMinMax.max)
            this.instantZoom = false
            this.instantScroll = false
        }
            
        if (boundMinMax.max > this.constraints.value.max){
            this.instantZoom = true
            this.instantScroll = true
            this.zoomToRange(boundMinMax.min, this.constraints.value.max)
            this.instantZoom = false
            this.instantScroll = false
        }
        
        
        this.tryPlotSubSegments_in_out()
    }


    getViewportAttributes(){
        var rect = this.rect


        var multiplyFactor = Math.pow(10, parseInt(((this.zoom <= 1 ? 1 / this.zoom : this.zoom)).toString().split('.')[0].length))
        //console.log('multiplyFactor: ' + multiplyFactor)
        if (multiplyFactor.toString().length > this.constraints.decimals && this.zoom > 1) multiplyFactor = Math.pow(10, this.constraints.decimals)

        
        var multiplier = (this.zoom <= 1 ? multiplyFactor / 10 : multiplyFactor)
        //console.log('multiplier: ', multiplier)

        var zoomWrapped = (this.zoom <= 1 ? this.zoom * multiplyFactor : this.zoom / multiplyFactor)
        //console.log('zoomWrapped: ', zoomWrapped)

        var subSegCount = Math.ceil(sk.utils.map(zoomWrapped, 10, 0, 1, 10))
        if (subSegCount < 1){
            if (subSegCount === 0 || subSegCount === -0) subSegCount = 1
            else subSegCount = 0-subSegCount
        }
        //console.log('subSegCount: ', subSegCount)

        var realSegmentSize = this.placeHolderSegment.segmentArea * (this.zoom <= 1 ? (zoomWrapped / 10) : zoomWrapped)
        //console.log('realSegmentSize: ' + realSegmentSize)


        var segmentsFitInView = Math.ceil((rect.height - this.scroll) / realSegmentSize)
        if (isNaN(segmentsFitInView) || segmentsFitInView === Infinity) segmentsFitInView = 1
        //console.log('segmentsFitInView: ' + segmentsFitInView)

        var segmentsBypassIdx = Math.floor((0-this.scroll) / realSegmentSize)
        //console.log('segmentsBypassIdx: ' + segmentsBypassIdx)

        var segMultiplier = (this.zoom <= 1 ? multiplier : 1 / multiplier)

        return {
            rect: rect,
            multiplyFactor: multiplyFactor,
            multiplier: multiplier,
            zoomWrapped: zoomWrapped,
            subSegCount: subSegCount,
            realSegmentSize: realSegmentSize,
            segmentsFitInView: segmentsFitInView,
            segmentsBypassIdx: segmentsBypassIdx,
            segMultiplier: segMultiplier
        }
    }

    tryPlotSubSegments_in_out(){
        var vpa = this.getViewportAttributes()

        for (var i = vpa.segmentsBypassIdx; i <= vpa.segmentsFitInView; i++){

            var subsegment = new sk_ui_ruler_segment({
                parent: this,
                canvas: this
            })
            subsegment.parentRect = vpa.rect
            subsegment.dbgOffset = this.dbgOffset
            if (this.onFormatTickLabel) subsegment.onFormatTickLabel = res => { if (this.onFormatTickLabel) this.onFormatTickLabel(res) }
            subsegment.realSize = vpa.realSegmentSize
            subsegment.top = i * subsegment.realSize + this.scroll
            subsegment.index = i
            subsegment.multiplier = vpa.segMultiplier
            if (subsegment.multiplier === 0) subsegment.multiplier = 1

            if (this.zoom <= 1) subsegment.startNumber = subsegment.pointsInSegment * i * (this.zoom <= 1 ? vpa.multiplier : 1)
            else subsegment.startNumber = subsegment.pointsInSegment * i / vpa.multiplier

            subsegment.incrementBy = (this.zoom <= 1 ? vpa.multiplier : 1 / vpa.multiplier)

            subsegment.plot()
        }
    }
}

class sk_ui_ruler_segment  {
    constructor(opt){
        this.parent = opt.parent
        this.canvas = opt.canvas

        this.idxColors = [
            'red',
            'green',
            'blue',
            'yellow',
            'grey',

            'teal',
            'white',
            'blue',
            'green',
            'grey',

        ]

        this.top = 0

        this.pointsInSegment = 10

        this.labelSize = 10
        this.labelMargin = 8
        this.labelArea = (this.labelSize + this.labelMargin)
        this.segmentArea = this.labelArea * this.pointsInSegment
        this.interval = 1
        
        this.startNumber = 0
        this.divider = 1

        this.realSize = this.segmentArea
    }

    
    getInterval(){
        var intervals = [1, 2, 5, 10]

        var first_lowerBound = this.getYPosOfIdx(0) + this.labelArea
        var targetIntervalIdx = 0
        for (var i = 0; i < intervals.length; i++){
            var secondLowerBound = this.getYPosOfIdx(i)
            if (secondLowerBound < first_lowerBound) targetIntervalIdx = i
        }
        this.interval = intervals[targetIntervalIdx]

        return this.interval
    }


    getYPosOfIdx(idx){
        return this.dbgOffset + this.top + sk.utils.map(idx, 0, this.pointsInSegment, 0, this.realSize)
    }

    plot(){
        var interval = this.getInterval()
        
        for (var i = 0; i < this.pointsInSegment; i++){
            var wrap = sk.utils.wrapNum(interval, i)

            var opt = {
                sender: this,
                idx: i,
                
                major: wrap === 0,

                tickLength: 4,
                
                pos: {
                    y: this.getYPosOfIdx(i)
                },

                label: {
                    text: (this.startNumber + (this.incrementBy * i)),
                    offset: {
                        x: 5,
                        y: (this.labelSize / 2)
                    },
                    size: this.labelSize,
                    color: sk.utils.cssVar('--sk_ui_color_grey_4')
                },

                line: {
                    color: sk.utils.cssVar('--sk_ui_color_grey_4')
                }
            }

            //if (this.parent.reverse) opt.label.text = 0-opt.label.text

            if (opt.pos.y < this.dbgOffset - this.labelArea || opt.pos.y > this.dbgOffset + this.parentRect.height + this.labelArea) continue

            if (this.onFormatTickLabel){ this.onFormatTickLabel(opt) }
            else {
                if (wrap !== 0){
                    opt.label.text = ''
                    //continue
                }
            }

            if (!opt.major){
                opt.tickLength = sk.utils.map(this.realSize, 0, this.segmentArea, 0, 4)
                //opt.label.size = sk.utils.map(opt.tickLength, 0, 4, 0, 10)
            }
            
            if (!opt.bypass) this.plotPoint(opt)
        }


        return
        this.canvas.line({
            color: this.idxColors[sk.utils.wrapNum(this.idxColors.length, this.index)],
            from: {
                x: 0,
                y: this.dbgOffset + this.top
            },
            to: {
                x: 0,
                y: this.dbgOffset + this.top + this.realSize,
            }
        })
    }

    plotPoint(opt){
        var tickOpt = {
            color: opt.line.color,

            from: {
                x: 0,
                y: Math.floor(opt.pos.y)
            },

            to: {
                x: Math.floor(opt.tickLength),
                y: Math.floor(opt.pos.y)
            }
        }

        var textOpt = {
            font: {
                size: opt.label.size,
                color: opt.label.color
            },
            text: opt.label.text,
            left: Math.floor(opt.label.offset.x),
            top : Math.floor(opt.pos.y - opt.label.offset.y),
        }

        if (this.parent.oppositeSide){
            tickOpt.from.x = Math.floor(this.parentRect.width - opt.tickLength)
            tickOpt.to.x = Math.floor(this.parentRect.width)

            var labelWidth = this.parent.measureText({text: textOpt.text, font: {size: textOpt.font.size}}).width
            textOpt.left = Math.floor(this.parentRect.width - opt.label.offset.x - labelWidth)
        }

        this.canvas.line(tickOpt)
        this.canvas.text(textOpt)
    }
    
}

