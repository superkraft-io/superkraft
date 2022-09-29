class sk_ui_overflowContainer extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.vertical = false
        this.compact = true


        
        
        this.scrollbarWrapper = this.add.component(_c => {
            _c.styling = 'top left'
            _c.compact = true
            _c.classAdd('sk_ui_overflowContainer_scrollbarWrapper')

            this.scrollbarNative = _c.add.component(_c => {
                _c.styling = 'top left'
                _c.classAdd('sk_ui_overflowContainer_native_scrollbar')
                _c.animate = false
                _c.fakeContent = _c.add.component(_c => {
                    _c.classAdd('sk_ui_overflowContainer_native_scrollbar_fakeContent')
                    _c.animate = false
                })

                _c.element.addEventListener('scroll', _e => {
                    var scrollPos = 0-(_c.fakeContent.rect.top - _c.rect.top)
                    console.log(scrollPos)
                    this.tween.to(scrollPos)
                })
            })
        })

        this.ums.on('sk_mobile', res => {
            if (res.data.orientation === 'portrait') this.scrollbar.hide(true)
            else this.scrollbar.show()
        })

        this.contentWrapper = this.add.component(_c => {
            _c.classAdd('sk_ui_overflowContainer_contentWrapper')
            _c.moveBefore(this.scrollbarWrapper)
            this.content = _c.add.component(_c => {
                _c.animate = false
                _c.classAdd('sk_ui_overflowContainer_content')

                
                this.add = _c.add

                

                var observer = new ResizeObserver(()=>{
                    var cRect = _c.rect
                    this.scrollbarNative.fakeContent.style.minHeight = cRect.height + 'px'
                    
                    this.scrollbar.updateDimensions()
                }).observe(_c.element)
            })

            _c.element.addEventListener('wheel', _e => {
                this.scrollbarNative.element.scrollTop += _e.deltaY
            })

            




            let pos = { top: 0, left: 0, x: 0, y: 0 };

            

            const mouseMoveHandler = _e => {
                this.content.style.pointerEvents = 'none'

                // How far the mouse has been moved
                const dx = (_e.clientX || _e.touches[0].clientX) - pos.x;
                const dy = (_e.clientY || _e.touches[0].clientY) - pos.y;

                this.scrollbarNative.element.scrollTop = pos.top - dy
            }

            const mouseUpHandler = _e => {
                this.content.style.pointerEvents = ''

                _c.element.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mousemove', mouseMoveHandler);

                _c.element.removeEventListener('mouseup', mouseUpHandler);
                document.removeEventListener('mouseup', mouseUpHandler);


                _c.element.removeEventListener('touchmove', mouseMoveHandler);
                document.removeEventListener('touchmove', mouseMoveHandler);

                _c.element.removeEventListener('touchend', mouseUpHandler);
                document.removeEventListener('touchend', mouseUpHandler);
            
                _c.element.style.cursor = '';
                _c.element.style.removeProperty('user-select');
            };



            const mouseDownHandler = _e => {

                pos = {
                    // The current scroll
                    left: this.scrollbarNative.element.scrollLeft,
                    top: this.scrollbarNative.element.scrollTop,
                    // Get the current mouse position
                    x: (_e.clientX || _e.touches[0].clientX),
                    y: (_e.clientY || _e.touches[0].clientY),
                };

                _c.element.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mousemove', mouseMoveHandler);

                _c.element.addEventListener('mouseup', mouseUpHandler);
                document.addEventListener('mouseup', mouseUpHandler);


                _c.element.addEventListener('touchmove', mouseMoveHandler);
                //document.addEventListener('touchmove', mouseMoveHandler);

                _c.element.addEventListener('touchend', mouseUpHandler);
                document.addEventListener('touchend', mouseUpHandler);

                if (!this.canScroll) return
                _c.element.style.cursor = 'grabbing';
                _c.element.style.userSelect = 'none';
            }

            _c.element.addEventListener('mousedown', mouseDownHandler);
            _c.element.addEventListener('touchstart', mouseDownHandler);
        })

        var observer = new ResizeObserver(()=>{
            var cRect = this.content.rect
            this.scrollbarNative.fakeContent.style.minHeight = cRect.height + 'px'
            updateHandleTopPos(this.tween.current)
        }).observe(this.element)


        this.scrollbar = this.scrollbarWrapper.add.fromNew(sk_ui_overflowContainer_scrollbar, _c => {
            _c.wrapper = this.contentWrapper
            _c.content = this.content
            _c.onWheel = _e => {
                this.scrollbarNative.element.scrollTop += _e.deltaY
            }

            _c.onShow = ()=>{
                this.scrollbarWrapper.style.width = 'var(--sk_ui_scrollbar_width)'
                this.scrollbarWrapper.opacity = 1
                this.canScroll = true
            }

            _c.onHide = (canScroll = false)=>{
                this.scrollbarWrapper.style.width = '0px'
                this.scrollbarWrapper.opacity = 0.01
                this.canScroll = canScroll
            }

            _c.onDecoupled = decoupled => {
                if (decoupled){
                    this.scrollbarWrapper.style.right = '-10px'
                } else {
                    this.scrollbarWrapper.style.right = ''
                }
            }
        })


        /****/


        var updateHandleTopPos = val => {
            var diff = this.content.rect.height - this.contentWrapper.rect.height
            var scrollPercent = val / diff
            this.scrollbar.setTop(scrollPercent)
        }

        this.tween = new sk_tween({
            decoupled: true,
            speed: 100,
            onChanged: _t => {
                console.log(_t.current)
                this.content.style.transform = `translate(0px, ${0-_t.current}px)`
                updateHandleTopPos(_t.current)
            }
        })

        var step = _ts => {
            this.tween.step()
            window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)

        //this.scrollbar.decoupled = true
    }
}

class sk_ui_overflowContainer_scrollbar extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'top left'
        this.animate = false

        this.handle = this.add.component(_c => {
            _c.classAdd('sk_ui_overflowContainer_scrollbar_handle')
            _c.animate = false
        })

        this.element.addEventListener('wheel', _e => {
            this.onWheel(_e)
        })


        this.getSizeDiff = (a, b)=>{
            var tRect = a.rect
            var cRect = b.rect
            if (tRect.height < cRect.height) return tRect.height / cRect.height
            else return 1
        }
    }

    setTop(val){

        this.updateDimensions()

        var thisHeight = this.rect.height
        var handleHeight = this.handle.rect.height

        var diff = thisHeight - handleHeight

        var top = diff*val

        this.handle.style.top = top + 'px'
    }

    updateDimensions(){
        var heightRatio = this.getSizeDiff(this.wrapper, this.content)

        var handleSize = 100 * heightRatio
        this.handle.style.height = handleSize + '%'

        if (handleSize === 100) this.onHide()
        else this.onShow()
    }

    set decoupled(val){
        this.__decoupled  = val
        this.onDecoupled(val)
    }
}