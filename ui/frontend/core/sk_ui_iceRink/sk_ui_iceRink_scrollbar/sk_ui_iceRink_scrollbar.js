class sk_ui_iceRink_scrollbar extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'left top ttb'
        this.animate = false
        setTimeout(()=>{ this.animate = true }, 1)

        
        this.style.width = '0px'
        this.style.height = '0px'

        this.handleContainer = this.add.component(_c => {
            _c.classAdd('sk_ui_iceRink_scrollbar_handleContainer')
            _c.styling = 'left top ttb'
            
            this.handle = _c.add.fromClass(sk_ui_iceRink_scrollbar_handle, _c => {
                _c.onMoving = res => {
                    var scrollbarLength = (this.vertical ? this.rect.height : this.rect.width)
                    var handleLength = (this.vertical ? this.handle.rect.height : this.handle.rect.width)
                    var scrollableLength = scrollbarLength - handleLength
                    
                    var pos = sk.utils.map((this.vertical ? res.position.y : res.position.x), 0, scrollableLength, 0, 1)

                    this.onScrolling(pos)
                }

                _c.onBeginMoving = ()=>{
                    this.onBeginScrolling()
                }

                _c.onEndMoving = ()=>{
                    this.onEndScrolling()                    
                }
            })
        })        

        this.attributes.add({friendlyName: 'Vertical', name: 'vertical', type: 'bool', onSet: val => {
            this.classRemove('sk_ui_iceRink_scrollbar_horizontal')
            this.classRemove('sk_ui_iceRink_scrollbar_vertical')

            if (val){
                this.classAdd('sk_ui_iceRink_scrollbar_vertical')
                this.handle.movable = 'y'
                if (this.visible) this.style.width = ''
                this.style.height = ''
            } else {
                this.classAdd('sk_ui_iceRink_scrollbar_horizontal')
                this.handle.movable = 'x'
                this.style.width = ''
                if (this.visible) this.style.height = ''
            }
        }})
        this.__vertical = 'none'
        this.vertical = false

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', onSet: val => {
            this.handle.style[(this.vertical ? 'height' : 'width')] = val
            this.__handleLength = undefined
        }})

        // Its size, from an observer: position and updateHandleSize run on every scroll frame, and
        // reading the size there (after the scroll's style writes) made the browser lay out again.
        this.__size = undefined
        new ResizeObserver(records => {
            var r = records[records.length - 1]
            var box = r.borderBoxSize && r.borderBoxSize[0]
            this.__size = {width: box ? box.inlineSize : r.contentRect.width, height: box ? box.blockSize : r.contentRect.height}
            if (this.onResized) this.onResized()
        }).observe(this.element)
    }

    // Along its axis (read from the page only until the observer has reported).
    get length(){
        if (!this.__size) return (this.vertical ? this.rect.height : this.rect.width)
        return (this.vertical ? this.__size.height : this.__size.width)
    }

    get handleLength(){
        if (this.__handleLength !== undefined) return this.__handleLength
        return (this.vertical ? this.handle.rect.height : this.handle.rect.width)
    }

    set position(percent){

        var scrollbarLength = this.length
        var handleLength = this.handleLength
        var scrollableLength = scrollbarLength - handleLength


        var pos = sk.utils.map(percent, 0, 1, 0, scrollableLength)
        if (pos <= 0 - (handleLength - 8)) pos = 0 - (handleLength - 8)
        if (pos >= scrollbarLength - 8) pos = scrollbarLength - 8

        if (this.handle.dragging || pos === this.__pos) return
        this.__pos = pos
        this.handle.style[(this.vertical ? 'top' : 'left')] = pos + 'px'
    }

    show(){
        if (this.hidden) return
        
        if (this.vertical === true){
            this.style.width = ''
        } else {
            this.style.height = ''
        }
    }

    hide(){
        if (this.vertical === true){
            this.style.width = '0px'
        } else {
            this.style.height = '0px'
        }
    }

    updateHandleSize(contentSize) {
        const scrollbarSize = this.length;
        const calculatedSize = (scrollbarSize / contentSize) * scrollbarSize;
        const finalHandleSize = Math.max(calculatedSize, 8);
        if (finalHandleSize === this.__handleLength) return
        this.__handleLength = finalHandleSize
        this.handle.style[(this.vertical ? 'height' : 'width')] = `${finalHandleSize}px`;
    }
}

class sk_ui_iceRink_scrollbar_handle extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.animate = false
        
        this.movable = 'y'

        this.movres_izer.onBeginMoving = res => {
            res.event.preventDefault()
            res.event.stopPropagation()

            this.dragging = true

            this.onBeginMoving()
        }

        this.movres_izer.onMoving = res => {
            res.event.preventDefault()
            res.event.stopPropagation()

            this.onMoving(res)
        }

        this.movres_izer.onEndMoving = res => {
            res.event.preventDefault()
            res.event.stopPropagation()

            this.dragging = false

            this.onEndMoving()
        }
    }
}