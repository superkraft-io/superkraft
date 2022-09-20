class sk_ui_scrollbar extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'left top'

        this.hDelta = 0

        this.handle = this.add.cmpnnt(_c => {
            _c.classAdd('sk_ui_scrollbar_handle')
            _c.animate = false
            _c.element.isScrollbarHandle = true
        })

        var observer = new ResizeObserver(()=>{
            var pRect = this.parent.rect
            this.style.left = (pRect.right - pRect.left + 4) + 'px'

            this.hDelta = pRect.height - this.handle.rect.height
            
            var pMarginTop = getComputedStyle(this.parent.element).getPropertyValue('margin-top')
            this.style.top = (pRect.top - pMarginTop) + 'px'

            
            this.style.height = pRect.height + 'px'
            
        }).observe(this.parent.element)


        this.handle.currMarginTop = 0
        
    
        var releaseMouseMove = ()=>{
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('mousemove', onMouseMove)
        }
    
        var onMouseUp = (_e)=>{
            this.mdPos = undefined
            this.handle.currMarginTop = this.handle.marginTop
            releaseMouseMove()
        }
    

        this.moveHandle = (delta, fromExternal, multiplier = 1)=>{
            var pRect = this.rect

            this.hDelta = pRect.height - this.handle.rect.height
            var handleY = delta * multiplier
            if (handleY < 0) handleY = 0
            if (handleY > pRect.height - this.handle.rect.height) handleY = this.hDelta

            //this.handle.marginTop = handleY

            var scrollPercentage = (1/this.hDelta) * handleY

            if (scrollPercentage < 0) scrollPercentage = 0
            if (scrollPercentage > 1) scrollPercentage = 1

            this.onScrollPosChanged(scrollPercentage, fromExternal)
        }

        var onMouseMove = (_e)=>{
            if (!this.mdPos) return

            var pRect = this.rect
            var y = _e.clientY - pRect.top
            var delta = y - this.mdPos.y

            this.moveHandle(delta)
        }


        var hookMouseMove = ()=>{
            window.addEventListener('mouseup', onMouseUp)
            window.addEventListener('mousemove', onMouseMove)
        }

        this.element.addEventListener('mousedown', _e => {
            this.mdPos = {_e: _e, x: _e.offsetX, y: _e.offsetY}
            hookMouseMove()
        })

        
        var onParentMouseWheel = _e => {
            _e.stopPropagation()
            
            var invert = false
            if (navigator.platform.indexOf('Win') > -1) invert = true
            if (_e.path[0].isScrollbarHandle) invert = false

            var newVal = (invert ? 0-_e.deltaY : _e.deltaY) * 0.1

            this.scrollVal.lastDelta += newVal

            if (this.scrollVal.lastDelta < 0) this.scrollVal.lastDelta  = 0
            if (this.scrollVal.lastDelta >= this.scrollbar.hDelta) this.scrollVal.lastDelta = this.scrollbar.hDelta

            this.moveHandle(this.scrollVal.lastDelta, true)
        }

        var getSizeDiff = (a, b)=>{
            var tRect = a.rect
            var cRect = b.rect
            if (tRect.height < cRect.height) return tRect.height / cRect.height
        }

        var observer = new ResizeObserver(()=>{
            var heightRatio = getSizeDiff(this, this.parent.content)
            if (heightRatio){
                this.handleHeight = heightRatio
                this.show()
            } else {
                this.hide()
            }
        }).observe(this.parent.element)

        this.parent.element.addEventListener('wheel', onParentMouseWheel)
    }

    

    set handleHeight(val){
        this.handle.style.height = (100 * val) + '%'
    }

    set decoupled(val){
        this.__decoupled = val
        this.update()
    }

    update(){

    }

    show(){
        this.animate = true
        this.classRemove('sk_ui_scrollbar_hidden')
        setTimeout(()=>{ this.animate = false }, 200)
    }

    hide(){
        this.animate = true
        this.classAdd('sk_ui_scrollbar_hidden')
        setTimeout(()=>{ this.animate = false }, 200)
    }

    scrollTo(val){
        this.moveHandle(this.hDelta * val, true)
    }
}