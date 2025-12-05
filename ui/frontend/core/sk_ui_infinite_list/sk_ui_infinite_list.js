/************

TODO
-   Allow for different size rows

************/

class sk_ui_infinite_list extends sk_ui_iceRink {
    constructor(opt){
        super(opt)

        //this.colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime', 'teal', 'brown', 'grey']
        //this.clrIdx = -1


        this.styling = 'top left fullwidth'
        this.hideOverflow = true

        this.autoHeight = false
        this.content.styling = 'top middle ttb fullwidth'
        this.content.position = 'relative'
        this.content.compact = true

        this.overscan = 10 //in rows
        this.__rowCount = 0
        this.__rowSize = 32
        this.lastWrapCount = 0
        this.fetchDelay = 100

        this.placeholderClass = sk_ui_infinite_list_placeholderRow
        this.placeholderContainer = this.rootAdd.fromClass(sk_ui_infinite_list_placeholderContainer)

        this.onResized = ()=>{
            this.placeholderContainer.update()
            this.updatePlaceholderPositions()
        }


        this.scrollRes = {x:0, y:0, directions: {x: 0, y: 0}, isOverscrolling:{x:false, y:false, any: false}, bottom:0, right:0}
        this.onScroll = res => {
            this.scrollRes = res
            this.offsetWrap = sk.utils.wrapNum(0-this.__rowSize, res.y, true)
            this.updatePlaceholderPositions()
            this.destroyAllRowsOutOfBounds()
        }


        setInterval(()=>{
            this.destroyAllRowsOutOfBounds()
        }, 1000)
    }

    set rowCount(val){
        this.__rowCount = val

        var bottom = this.__rowSize * val

        this.content.style.height = bottom + 'px'

        this.doObserveOnce()
    }

    set rowSize(val){
        this.__rowSize = val
        this.doObserveOnce()
    }

    get overscanInPx(){
        return this.overscan * this.__rowSize
    }
    

    updatePlaceholderPositions(){
        if (this.scrollRes.isOverscrolling.any === false){
            this.placeholderContainer.style.top = (this.offsetWrap ? this.offsetWrap.result : 0) + 'px'
            this.lastWrapCount = (this.offsetWrap ? this.offsetWrap.wrapCount : 0)
        } else {
            if (this.scrollRes.isOverscrolling.y === 'bottom'){
                this.placeholderContainer.style.top = this.scrollRes.bottom + 'px'
            } else if (this.scrollRes.isOverscrolling.y === 'top'){
                this.placeholderContainer.style.top = this.scrollRes.y + 'px'
            }
        }




        //wrap relevant placeholders
        if (this.offsetWrap){
            var direction = this.scrollRes.directions.y
            var wrapCount = this.offsetWrap.wrapCount

            if (wrapCount !== this.__lastWrapCount){
                var diffWraps = wrapCount - this.__lastWrapCount
                if (diffWraps < 0) diffWraps = 0-diffWraps

                for (var i = 0; i < diffWraps; i++){
                    if (direction === -1){
                        this.placeholderContainer.wrapLastToFirst()
                    } else if (direction === 1) {
                        this.placeholderContainer.wrapFirstToLast()
                    }
                }

                this.__lastWrapCount = wrapCount
            }

        }


        this.placeholderContainer.finalizeUpdate()
    }

    addRealRow(info, classRef){
        this.placeholderContainer.resetBusyByIdx(info.idx)

        var placeholder = this.placeholderContainer.findPlaceholderForIdx(info.idx)
        if (placeholder) placeholder.style.visibility = 'hidden'
        
        return this.add.fromClass(classRef, _c => {
            delete this.placeholderContainer.busyFetching[info.idx]

            _c.style.position = 'absolute'
            _c.style.top = info.pos.y + 'px'
            _c.style.left = '0px'
            _c.style.width = '100%'
            _c.style.height = this.__rowSize + 'px'
            _c.info = info
            _c.__sk_ui_infinite_list_idx = info.idx

            _c.init()
        })
    }

    destroyAllRowsOutOfBounds(){
        var overscanInPx = this.overscanInPx
        //console.log(overscanInPx + '  vs  ' + (this.overscan * this.__rowSize))
        for (var i = this.content.children.children.length - 1; i >= 0; i--){
            var row = this.content.children.children[i]
            var rowYPos = row.rect.localPos.y + this.scrollRes.y
            //console.log(`(${row.__sk_ui_infinite_list_idx})   ${rowYPos}`)
            var isOutsideTop = rowYPos < 0-overscanInPx
            var isOutsideBottom = rowYPos > this.rect.height + overscanInPx
            if (isOutsideTop || isOutsideBottom){
                //console.log('removed ' + row.__sk_ui_infinite_list_idx)
                row.remove()
            }
        }
    }


    findRowByIdx(idx){
        for (var i = this.content.children.children.length - 1; i >= 0; i--){
            var row = this.content.children.children[i]
            if (row.__sk_ui_infinite_list_idx === idx){
                return row
            }
        }
    }

    scrollToIdx(idx){
        var realRow = this.findRowByIdx(idx)
        if (realRow){
            realRow.scrollTo()
            return
        }

        var yPos = this.__rowSize * idx
        this.scrollTo(0-yPos)
    }
}

class sk_ui_infinite_list_placeholderRow extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'top left fullwidth'
        this.style.minHeight = this.parent.parent.__rowSize +'px'

        this.animate = false

        /*this.label = this.add.label(_c => {
            _c.text = 'Row'
        })*/
        
        this.reset()
    }

    set index(val){
        this.__index = val
        //this.label.text = 'Row ' + val
    }
    
    get index(){
        return this.__index
    }

    async reset(){
        this.classRemove('sk_ui_infinite_list_placeholderRow_animated');
        void this.element.offsetWidth;
        this.classAdd('sk_ui_infinite_list_placeholderRow_animated');
    }
}

class sk_ui_infinite_list_placeholderContainer extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'top left ttb fullwidth fullheight'

        this.animate = false

        this.compact = true

        //this.colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime', 'teal', 'brown', 'grey']
        //this.clrIdx = -1

        this.fetchList = {}

        this.lastPresentedRange = undefined

        this.busyFetching = {}
    }

    findPlaceholderForIdx(idx){
        for (var i = 0; i < this.children.children.length; i++){
            var placeholder = this.children.children[i]
            if (placeholder.idx === idx) return placeholder
        }
    }

    get placeholdersFitInHeight(){
        return Math.ceil((this.rect.height + this.parent.__rowSize * 1) / this.parent.__rowSize)
    }

    resetBusyByIdx(idx){
        delete this.busyFetching[idx]
    }

    
    update(){

        //this.clrIdx = sk.utils.wrapNum(this.colors.length, this.children.children.length - 1)

        var diff = this.placeholdersFitInHeight - this.children.children.length

        if (isNaN(diff)){
            setTimeout(() => {
                this.update()
            }, 100)
            return
        }
        var operation = 'none'
        
        if (diff > 0) {
            operation = 'add'
        } else if (diff < -1){
            operation = 'remove'
            diff = 0-diff
        }

        if (operation === 'add'){
            for (var i = 0; i < diff; i++){
                //this.clrIdx++
                //if (this.clrIdx >= this.colors.length) this.clrIdx = 0

                var row = this.add.fromClass(this.parent.placeholderClass)
                //row.label.text = this.children.children.length - 1
                //row.backgroundColor = this.colors[this.clrIdx]
            }
        } else if (operation === 'remove'){
            var from = this.children.children.length - diff
            var to = this.children.children.length - 1

            for (var i = to; i >= from; i--){
                var row = this.children.children[i]
                row.remove()
            }
        }

        
    }

    finalizeUpdate(){
        //get the range of rows to fetch for
        var range = this.presentationRange

        //update placeholder labels
        var placeholderIdx = -1
        for (var idx = range.visible.start; idx <= range.visible.end; idx++){
            placeholderIdx++
            var placeholder = this.children.children[placeholderIdx]
            placeholder.idx = idx
            //placeholder.label.text = idx
        }

        //hide placeholders that are out of range
        this.hideAllPlaceholdersOutOfIndexRange()

        //get range to fetch for
        var rangeToFetch = this.getRangeToFetch(range.overscanned)

        //fetch range
        if (rangeToFetch.length > 0) this.fetchForRange(rangeToFetch)
    }

    getRangeToFetch(currentRange){
        var toFetch = []
        for (var idx = currentRange.start; idx < currentRange.end; idx++){
            var isWithinRange = (idx >= 0 && idx <= this.parent.__rowCount)
            var isReady = (!this.busyFetching[idx] && !this.parent.findRowByIdx(idx))
            if (isReady && isWithinRange) toFetch.push(idx)
        }

        return toFetch
    }

    fetchForRange(range){
        var newFetchInfo = (idx)=>{
            if (this.busyFetching[idx]) return

            var fetchInfo = {
                idx: idx,
                pos: {
                    x: 0,
                    y: idx * this.parent.__rowSize
                },

                reset: ()=>{
                    delete this.busyFetching[idx]
                }
            }

            this.addToFetchList(fetchInfo)
        }

        for (var i in range){
            var idx = range[i]
            newFetchInfo(idx)
            this.busyFetching[idx] = true
        }
    }


    hideAllPlaceholdersOutOfIndexRange(){
        for (var i = 0; i < this.element.children.length; i++){
            var child = this.element.children[i]
            var placeholder = child.sk_ui_obj
            var idx = placeholder.idx
            //console.log(idx)

            var realRow = this.parent.findRowByIdx(idx)
            if (idx >= this.parent.__rowCount || realRow){
                placeholder.style.visibility = 'hidden'
            } else {
                placeholder.style.visibility = ''
            }
        }
    }

    get presentationRange(){
        var startIdx = (this.parent.offsetWrap ? this.parent.offsetWrap.wrapCount : 0)
        if (startIdx < 0) startIdx = 0
        
        var endIdx = startIdx + this.placeholdersFitInHeight - 1

        var overscanned_startIdx = startIdx - this.parent.overscan
        var overscanned_endIdx   = endIdx + this.parent.overscan
        
        if (overscanned_startIdx < 0) overscanned_startIdx = 0
        if (overscanned_endIdx > this.parent.__rowCount) overscanned_endIdx = this.parent.__rowCount

        return {visible: {start: startIdx, end: endIdx}, overscanned: {start: overscanned_startIdx, end: overscanned_endIdx}}
    }

    wrapFirstToLast(){
        var firstRow = this.children.children[0]
        var lastRow = this.children.children[this.children.children.length - 1]
        firstRow.moveAfter(lastRow)
    }

    wrapLastToFirst(){
        var firstRow = this.children.children[0]
        var lastRow = this.children.children[this.children.children.length - 1]
        lastRow.moveBefore(firstRow)
    }

    addToFetchList(rowInfo){
        this.fetchList[rowInfo.idx] = rowInfo

        clearTimeout(this.fetchTimer)
        this.fetchTimer = setTimeout(() => {
            var tmpFetchList = Object.values(this.fetchList).slice(0)
            this.fetchList = {}

            if (this.parent.onFetchForRows) this.parent.onFetchForRows(tmpFetchList)
        }, this.parent.fetchDelay)
    }
}