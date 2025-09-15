class sk_ui_infinite_list extends sk_ui_iceRink {
    constructor(opt){
        super(opt)

        this.colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime', 'teal', 'brown', 'grey']
        this.clrIdx = -1


        this.autoHeight = false
        this.content.styling = 'top middle ttb fullwidth'
        this.content.position = 'relative'

        this.__rowSize = 32
        this.lastWrapCount = 0

        this.placeHolderPanel = this.rootAdd.fromNew(sk_ui_infinite_list_placeholderPanel)

        this.onResized = ()=>{
            this.placeHolderPanel.update()
            this.updatePlaceholderPositions()
        }


        this.scrollRes = {x:0, y:0, isOverscrolling:{x:false, y:false, any: false}, bottom:0, right:0}
        this.onScroll = res => {
            this.scrollRes = res
            this.offsetWrap = sk.utils.wrapNum(0-this.__rowSize, res.y, true)
            this.updatePlaceholderPositions()
        }


        
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

    get rowsFitInHeight(){
        return Math.floor(this.contentWrapper.rect.height / this.__rowSize)
    }


    

    updatePlaceholderPositions(){

        if (this.scrollRes.isOverscrolling.any === false){
            this.placeHolderPanel.style.top = (this.offsetWrap ? this.offsetWrap.result : 0) + 'px'
            
             if (this.lastWrapCount !== (this.offsetWrap ? this.offsetWrap.wrapCount : 0)){
                if (this.offsetWrap.wrapCount > this.lastWrapCount){
                    this.placeHolderPanel.wrapFirstToLast()
                } else {
                    this.placeHolderPanel.wrapLastToFirst()
                }
            }
            this.lastWrapCount = (this.offsetWrap ? this.offsetWrap.wrapCount : 0)
        } else {
            if (this.scrollRes.isOverscrolling.y === 'bottom'){
                this.placeHolderPanel.style.top = this.scrollRes.bottom + 'px'
            } else if (this.scrollRes.isOverscrolling.y === 'top'){
                this.placeHolderPanel.style.top = this.scrollRes.y + 'px'
            }
        }


        this.placeHolderPanel.handleOverflowingBuffers()
    }
}

class sk_ui_infinite_list_placeholderRow extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'top left fullwidth'
        this.style.minHeight = '32px'

        this.animate = false

        this.label = this.add.label(_c => {
            _c.text = 'Row'
        })
        
        this.resetAnimation()
    }

    set index(val){
        this.__index = val
        this.label.text = 'Row ' + val
    }
    
    get index(){
        return this.__index
    }

    async resetAnimation(){
        this.classRemove('sk_ui_infinite_list_placeholderRow_animated');
        requestAnimationFrame(() => {
            this.classAdd('sk_ui_infinite_list_placeholderRow_animated');
        });
    }
}

class sk_ui_infinite_list_placeholderPanel extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'top left ttb fullwidth fullheight'

        this.animate = false

        this.compact = true

        this.colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'lime', 'teal', 'brown', 'grey']
        this.clrIdx = -1
    }

    get rowsFitInHeight(){
        return Math.floor((this.rect.height + (this.parent.__rowSize * 2)) / this.parent.__rowSize)
    }
    
    update(){

        //this.clrIdx = sk.utils.wrapNum(this.colors.length, this.children.children.length - 1)

        var diff = this.rowsFitInHeight - this.children.children.length

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
                this.clrIdx++
                if (this.clrIdx >= this.colors.length) this.clrIdx = 0

                var row = this.add.fromNew(sk_ui_infinite_list_placeholderRow)
                row.label.text = this.children.children.length - 1
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

    handleOverflowingBuffers(){
        if (this.parent.scrollRes.isOverscrolling.any === false){
            var labelIdxStart = (this.parent.offsetWrap ? this.parent.offsetWrap.wrapCount : 0)

            this.clrIdx = Math.floor(sk.utils.wrapNum(this.colors.length, (this.parent.offsetWrap ? this.parent.offsetWrap.wrapCount : 0))) - 1

            for (var i = 0; i < this.children.children.length; i++){
                this.clrIdx++
                if (this.clrIdx >= this.colors.length) this.clrIdx = 0

                var row = this.children.children[i]
                row.label.text = labelIdxStart + i
                //row.backgroundColor = this.colors[this.clrIdx]
            }

            this.children.children[this.children.children.length - 1].style.display = ''
        } else {
            if (this.parent.scrollRes.isOverscrolling.y === 'bottom'){
                this.children.children[this.children.children.length - 1].style.display = 'none'
            }
        }
    }

    wrapFirstToLast(){
        var firstRow = this.children.children[0]
        var lastRow = this.children.children[this.children.children.length - 1]
        firstRow.moveBefore(lastRow)
        lastRow.moveBefore(firstRow)
        firstRow.resetAnimation()
    }

    wrapLastToFirst(){
        var row = this.children.children[this.children.children.length - 1]
        row.moveBefore(this.children.children[0])
        row.resetAnimation()
    }   
}