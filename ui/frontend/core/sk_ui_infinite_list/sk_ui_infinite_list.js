/************

Virtual list: only the rows in view (plus `overscan` rows on each side) exist in the DOM. Every row has the
same size. Rows that aren't there yet show a shimmering placeholder until the caller adds them.

    var list = this.add.infinite_list(_c => {
        _c.orientation = 'horizontal'   // or 'vertical' (default): rows top to bottom
        _c.rowSize = 100                // a row's height (vertical) or width (horizontal), in px
        _c.rowCount = 5000
        _c.onFetchForRows = infos => {
            infos.forEach(info => list.addRealRow(info, MyRowClass))   // MyRowClass gets info.idx and init()
        }
    })
    list.scrollToIdx(idx, center, animate)
    list.clear()                        // drops every row (new data); they're fetched again

In horizontal mode the mouse wheel's vertical scrolling scrolls the list sideways (most mice only have that).

TODO
-   Allow for different size rows

************/

class sk_ui_infinite_list extends sk_ui_iceRink {
    constructor(opt){
        super(opt)

        this.styling = 'top left fullwidth'
        this.hideOverflow = true

        this.autoHeight = false
        this.content.styling = 'top middle ttb fullwidth'
        this.content.compact = true

        this.overscan = 10 //in rows
        this.__rowCount = 0
        this.__rowSize = 32
        this.__orientation = 'vertical'
        this.__rows = new Map() //idx -> row
        this.__generation = 0
        this.fetchDelay = 100

        this.placeholderClass = sk_ui_infinite_list_placeholderRow
        this.placeholderContainer = this.content.add.fromClass(sk_ui_infinite_list_placeholderContainer, _c => {
            _c.list = this
        })

        this.scrollRes = {x:0, y:0, directions: {x: 0, y: 0}, isOverscrolling:{x:false, y:false, any: false}, bottom:0, right:0}

        //Follow the scroller (drag, wheel, inertia, programmatic scrolling)
        var onPositionCalculated = this.scroller.onPositionCalculated
        this.scroller.onPositionCalculated = (x, y) => {
            onPositionCalculated(x, y)
            this.__onScrollPos(x, y)
        }

        this.__viewport = {width: 0, height: 0}
        new ResizeObserver(entries => {
            var rect = entries[entries.length - 1].contentRect
            this.__viewport = {width: rect.width, height: rect.height}
            this.placeholderContainer.update()
            this.update()
        }).observe(this.contentWrapper.element)

        setInterval(()=>{
            if (this.element.isConnected) this.destroyAllRowsOutOfBounds()
        }, 1000)
    }

    set orientation(val){
        this.__orientation = (val === 'horizontal' ? 'horizontal' : 'vertical')

        if (this.isHorizontal){
            this.content.styling = 'top left fullheight'
            //Vertical wheel scrolling scrolls sideways
            this.onCustomScrollDeltaX = _e => (Math.abs(_e.deltaY) > Math.abs(_e.deltaX) ? _e.deltaY : _e.deltaX)
            this.onCustomScrollDeltaY = _e => 0
        } else {
            this.content.styling = 'top middle ttb fullwidth'
            delete this.onCustomScrollDeltaX
            delete this.onCustomScrollDeltaY
        }

        this.__applyContentSize()
        this.__relayoutRows()
        this.placeholderContainer.update()
        this.update()
    }

    get orientation(){
        return this.__orientation
    }

    get isHorizontal(){
        return this.__orientation === 'horizontal'
    }

    set rowCount(val){
        this.__rowCount = Math.max(0, Math.floor(val) || 0)

        this.__rows.forEach((row, idx) => {
            if (idx >= this.__rowCount) this.__removeRow(idx)
        })

        this.__applyContentSize()
        this.update()
    }

    get rowCount(){
        return this.__rowCount
    }

    set rowSize(val){
        this.__rowSize = val
        this.__applyContentSize()
        this.__relayoutRows()
        this.placeholderContainer.update()
        this.update()
    }

    get rowSize(){
        return this.__rowSize
    }

    get overscanInPx(){
        return this.overscan * this.__rowSize
    }

    //The visible length along the scrolling axis
    get viewportLength(){
        var size = this.__viewport[this.isHorizontal ? 'width' : 'height']
        if (!size) size = this.contentWrapper.element[this.isHorizontal ? 'clientWidth' : 'clientHeight']
        return size
    }

    //How far the list is scrolled along its axis, in px (negative while overscrolling the start)
    get scrolledBy(){
        return 0 - ((this.isHorizontal ? this.scrollRes.x : this.scrollRes.y) || 0)
    }

    __applyContentSize(){
        var length = this.__rowSize * this.__rowCount + 'px'
        this.content.style.width = (this.isHorizontal ? length : '')
        this.content.style.height = (this.isHorizontal ? '' : length)
    }

    __placeRow(row, idx){
        var pos = idx * this.__rowSize + 'px'
        var size = this.__rowSize + 'px'
        row.style.position = 'absolute'
        row.style.top = (this.isHorizontal ? '0px' : pos)
        row.style.left = (this.isHorizontal ? pos : '0px')
        row.style.width = (this.isHorizontal ? size : '100%')
        row.style.height = (this.isHorizontal ? '100%' : size)
    }

    __relayoutRows(){
        this.__rows.forEach((row, idx) => this.__placeRow(row, idx))
    }

    __onScrollPos(x, y){
        var last = this.scrollRes
        if (x === last.x && y === last.y) return

        var wrapper = this.contentWrapper.element
        var bottom = this.content.element.offsetHeight + y - wrapper.clientHeight
        var right = this.content.element.offsetWidth + x - wrapper.clientWidth

        var isOverscrolling = {x: false, y: false}
        if (bottom < 0) isOverscrolling.y = 'bottom'
        if (y > 0) isOverscrolling.y = 'top'
        if (right < 0) isOverscrolling.x = 'right'
        if (x > 0) isOverscrolling.x = 'left'
        isOverscrolling.any = (isOverscrolling.x || isOverscrolling.y)

        //1 = towards the end of the list, -1 = towards its start
        var directions = {
            x: (x < last.x ? 1 : x > last.x ? -1 : 0),
            y: (y < last.y ? 1 : y > last.y ? -1 : 0)
        }

        this.scrollRes = {x: x, y: y, bottom: bottom, right: right, isOverscrolling: isOverscrolling, directions: directions}
        if (this.onScroll) this.onScroll(this.scrollRes)

        this.update()
    }

    //Positions the placeholders for what's in view, fetches rows that are missing and drops those far out of view
    update(){
        var size = this.__rowSize
        var length = this.viewportLength
        if (!size || !length) return

        var scrolled = this.scrolledBy
        var first = Math.floor(scrolled / size)
        var last = Math.floor((scrolled + length - 1) / size)

        this.placeholderContainer.present(first, last)

        var from = Math.max(0, first - this.overscan)
        var to = Math.min(this.__rowCount - 1, last + this.overscan)
        var toFetch = []
        for (var idx = from; idx <= to; idx++){
            if (!this.placeholderContainer.busyFetching[idx] && !this.findRowByIdx(idx)) toFetch.push(idx)
        }
        if (toFetch.length > 0) this.placeholderContainer.fetchForRange(toFetch)

        this.destroyAllRowsOutOfBounds()
    }

    addRealRow(info, classRef){
        this.placeholderContainer.resetBusyByIdx(info.idx)

        //Fetched before clear(), or out of range by now
        if (info.generation !== this.__generation || info.idx >= this.__rowCount) return

        if (this.__rows.has(info.idx)) this.__removeRow(info.idx)

        var row = this.content.add.fromClass(classRef, _c => {
            this.__placeRow(_c, info.idx)
            _c.info = info
            _c.__sk_ui_infinite_list_idx = info.idx
            this.__rows.set(info.idx, _c)

            _c.init()
        })

        this.placeholderContainer.refreshVisibility()

        return row
    }

    __removeRow(idx){
        var row = this.__rows.get(idx)
        this.__rows.delete(idx)
        if (row && row.element.isConnected) row.remove()
    }

    //Whether a row is in view or in the overscan
    isIdxInBounds(idx){
        var rowPos = idx * this.__rowSize - this.scrolledBy
        return rowPos >= 0-this.overscanInPx && rowPos <= this.viewportLength + this.overscanInPx
    }

    destroyAllRowsOutOfBounds(){
        this.__rows.forEach((row, idx) => {
            if (!this.isIdxInBounds(idx) || !row.element.isConnected) this.__removeRow(idx)
        })
    }

    findRowByIdx(idx){
        var row = this.__rows.get(idx)
        if (row && row.element.isConnected) return row
    }

    //Every row that exists right now (in view or in the overscan)
    forEachRow(cb){
        this.__rows.forEach((row, idx) => cb(row, idx))
    }

    //Drops every row and fetches what's in view again (the data changed)
    clear(){
        this.__generation++
        Array.from(this.__rows.keys()).forEach(idx => this.__removeRow(idx))
        this.placeholderContainer.busyFetching = {}
        this.placeholderContainer.fetchList = {}
        this.update()
    }

    scrollToIdx(idx, center = false, animate = true){
        var size = this.__rowSize
        var pos = size * idx
        if (center) pos -= (this.viewportLength - size) / 2

        //The scroller only scrolls once it knows the sizes; make sure it has the current ones
        var wrapper = this.contentWrapper.element
        this.scroller.updateSize(wrapper.clientWidth, wrapper.clientHeight, this.content.element.offsetWidth, this.content.element.offsetHeight)

        if (this.isHorizontal) this.scrollTo(0-pos, null, animate)
        else this.scrollTo(null, 0-pos, animate)
    }
}

class sk_ui_infinite_list_placeholderRow extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'top left'
        this.animate = false

        this.reset()
    }

    set index(val){
        this.__index = val
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

        this.styling = 'top left'
        this.animate = false
        this.compact = true

        this.fetchList = {}
        this.busyFetching = {}
        this.pool = []
    }

    get placeholdersFitInLength(){
        return Math.ceil(this.list.viewportLength / this.list.__rowSize) + 1
    }

    findPlaceholderForIdx(idx){
        return this.pool.find(placeholder => placeholder.idx === idx)
    }

    resetBusyByIdx(idx){
        delete this.busyFetching[idx]
    }

    //Enough placeholders to cover the view, sized for the list's orientation
    update(){
        var count = this.placeholdersFitInLength
        if (!isFinite(count)) return

        while (this.pool.length < count) this.pool.push(this.add.fromClass(this.list.placeholderClass))
        while (this.pool.length > count) this.pool.pop().remove()

        var horizontal = this.list.isHorizontal
        var size = this.list.__rowSize + 'px'
        this.pool.forEach(placeholder => {
            placeholder.idx = undefined
            placeholder.style.position = 'absolute'
            placeholder.style.top = (horizontal ? '0px' : '')
            placeholder.style.left = (horizontal ? '' : '0px')
            placeholder.style.width = (horizontal ? size : '100%')
            placeholder.style.height = (horizontal ? '100%' : size)
        })
    }

    //Places a placeholder at every index from first to last. Index i always gets pool[i % count], so one
    //that stays in view keeps its element (and its shimmer) while scrolling.
    present(first, last){
        if (this.pool.length === 0) this.update()
        var count = this.pool.length
        if (count === 0) return

        var horizontal = this.list.isHorizontal
        var size = this.list.__rowSize

        for (var idx = first; idx <= last && idx < first + count; idx++){
            var placeholder = this.pool[((idx % count) + count) % count]
            if (placeholder.idx === idx) continue
            placeholder.idx = idx
            placeholder.index = idx
            placeholder.style[horizontal ? 'left' : 'top'] = (idx * size) + 'px'
        }

        this.firstIdx = first
        this.lastIdx = last
        this.refreshVisibility()
    }

    //Shows the placeholders of rows in view that aren't there yet
    refreshVisibility(){
        this.pool.forEach(placeholder => {
            var idx = placeholder.idx
            var show = (idx !== undefined && idx >= this.firstIdx && idx <= this.lastIdx && idx >= 0 && idx < this.list.__rowCount && !this.list.findRowByIdx(idx))
            var visibility = (show ? '' : 'hidden')
            if (placeholder.style.visibility !== visibility) placeholder.style.visibility = visibility
        })
    }

    fetchForRange(range){
        var list = this.list
        range.forEach(idx => {
            if (this.busyFetching[idx]) return

            var fetchInfo = {
                idx: idx,
                generation: list.__generation,
                pos: {
                    x: (list.isHorizontal ? idx * list.__rowSize : 0),
                    y: (list.isHorizontal ? 0 : idx * list.__rowSize)
                },

                reset: ()=>{
                    delete this.busyFetching[idx]
                }
            }

            this.busyFetching[idx] = true
            this.addToFetchList(fetchInfo)
        })
    }

    addToFetchList(rowInfo){
        this.fetchList[rowInfo.idx] = rowInfo

        clearTimeout(this.fetchTimer)
        this.fetchTimer = setTimeout(() => {
            //Only what's still current and in bounds (the list may have scrolled on meanwhile)
            var tmpFetchList = Object.values(this.fetchList).filter(info => {
                var wanted = (info.generation === this.list.__generation && info.idx < this.list.__rowCount && this.list.isIdxInBounds(info.idx))
                if (!wanted) delete this.busyFetching[info.idx]
                return wanted
            })
            this.fetchList = {}

            if (tmpFetchList.length > 0 && this.list.onFetchForRows) this.list.onFetchForRows(tmpFetchList)
        }, this.list.fetchDelay)
    }
}
