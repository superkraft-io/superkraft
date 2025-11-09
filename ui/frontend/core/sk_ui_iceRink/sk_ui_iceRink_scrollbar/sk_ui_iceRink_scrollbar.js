class sk_ui_iceRink_scrollbar extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'left top ttb'
        this.animate = false

        
        this.style.width = '0px'
        this.style.height = '0px'

        this.handleContainer = this.add.component(_c => {
            _c.classAdd('sk_ui_iceRink_scrollbar_handleContainer')
            _c.styling = 'left top ttb'
            
            this.handle = _c.add.fromNew(sk_ui_iceRink_scrollbar_handle, _c => {
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
        }})

    }

    set position(percent){
        
        var scrollbarLength = (this.vertical ? this.rect.height : this.rect.width)
        var handleLength = (this.vertical ? this.handle.rect.height : this.handle.rect.width)
        var scrollableLength = scrollbarLength - handleLength


        var pos = sk.utils.map(percent, 0, 1, 0, scrollableLength)
        if (pos <= 0 - (handleLength - 8)) pos = 0 - (handleLength - 8)
        if (pos >= scrollbarLength - 8) pos = scrollbarLength - 8

        if (!this.handle.dragging) this.handle.style[(this.vertical ? 'top' : 'left')] = pos + 'px'
    }

    show(){
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
        const scrollbarSize = (this.vertical ? this.rect.height : this.rect.width);
        const calculatedSize = (scrollbarSize / contentSize) * scrollbarSize;
        const finalHandleSize = Math.max(calculatedSize, 8);
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