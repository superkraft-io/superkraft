class sk_ui_iceRink extends sk_ui_component {
    constructor(opt){
        super(opt)
        this.styling = 'left top ttb'
        this.compact = true

        this.blockIceRink = true
        
        this.lastOverscrollVal = {x: 0, y: 0}
        
        this.__includedComponents = []

        this.contentWrapper = this.add.component(_c => {
            _c.classAdd('sk_ui_iceRink_contentWrapper')
            _c.styling = 'left top ttb'
            
            this.content = _c.add.component(_c => {
                _c.classAdd('sk_ui_iceRink_content')
                _c.animate = false

                /*var count = 50
                var btns = []
                for (var i=0; i < count; i++){
                    btns.push(_c.add.button(_c => {
                        _c.idx = i
                        _c.text = (i + 1) + ' -> ' + (count - i)
                        _c.style.marginLeft = sk.utils.map(i, 0, count, -75, 75) + '%'
                        _c.onClick = () => {
                            //_c.scrollTo()

                            this.scrollX = 0-_c.rect.localPos.x
                            //this.scrollY = 0-52*_c.idx
                        }

                        //_c.disabled = true
                    }))
                }*/
            })
        })
        
        
            
        
        this.scrollPos = {x: 0, y: 0}
        
        this.scroller = new SK_Rubberband()
        var scroller = this.scroller

        scroller.allowScrollX = true;
        scroller.allowScrollY = true;

        scroller.onPositionCalculated = (x, y) => {
            this.scrollPos = {x: x, y: y}
        }


        this.eventsAttached = false
        this.attachListeners = () => {
            scroller.startDrag(this.mdPos.x, this.mdPos.y)
            
            this.element.removeEventListener('mousemove', this.handleMouseMoveFromElement);
            this.element.removeEventListener('touchmove', this.handleMouseMoveFromElement);
            
            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('touchmove', this.handleMouseMove);
        }

        this.handleMouseWheel =  _e => {
            if (this.getParentIceRink()){
                _e.preventDefault()
                _e.stopPropagation()
            }

            var deltaX = _e.deltaX
            var deltaY = _e.deltaY

            if (this.onCustomScrollDeltaX) deltaX = this.onCustomScrollDeltaX(_e)
            if (this.onCustomScrollDeltaY) deltaY = this.onCustomScrollDeltaY(_e)

            scroller.handleWheelEvent(deltaX, deltaY)
        }

        this.element.addEventListener('wheel', this.handleMouseWheel)

        
        this.handleMouseMove = _e => {
            sk.interactions.block()
            var pos = sk.interactions.getPos(_e, true, this.rect)
            scroller.updatePosition(pos.x, pos.y)
        }


        this.mouseMovedFromElement_firstFiresCounter = 0
        
        this.handleMouseMoveFromElement = _e => {
            var pos = sk.interactions.getPos(_e, true, this.rect)
            var diff = {
                x: pos.x - this.mdPos.x,
                y: pos.y - this.mdPos.y
            }

            if (diff.x !== 0 || diff.y !== 0){
                if (!this.eventsAttached){
                    this.eventsAttached = true
                    this.attachListeners()
                }
            }
        }

        this.handleMouseUp = _e => {
            this.mouseMovedFromElement_firstFiresCounter = 0
            this.eventsAttached = false
            
            sk.interactions.unblock()
            scroller.endDrag()
            
            window.removeEventListener('mousemove', this.handleMouseMove)
            window.removeEventListener('mouseup', this.handleMouseUp)
            window.removeEventListener('touchmove', this.handleMouseMove);
            window.removeEventListener('touchend', this.handleMouseUp)

            
            this.element.removeEventListener('mousemove', this.handleMouseMoveFromElement);
            this.element.removeEventListener('touchmove', this.handleMouseMoveFromElement);
        }



        this.handleMouseDown = _e => {
            if (this.getParentIceRink()){
                _e.preventDefault()
                _e.stopPropagation()
            }

            var isLeftButton = false
            if (_e.button !== undefined && _e.button === 0) isLeftButton = true
            if (_e.touches !== undefined && _e.touches.length === 1) isLeftButton = true

            if (!isLeftButton) return

            var sk_ui_component = _e.target.closest('.sk_ui_component')
            var suo = sk_ui_component.sk_ui_obj
            if (suo){
                var isDisabled = suo.disabled
                if (suo.blockIceRink) return
            }

            //ensure that we can't trigger drag scrolling from a UI component that already listens to mouse events
            var mdEvs = _e.target.hasEventListener('mousedown')
            var tsEvs = _e.target.hasEventListener('touchstart')
            var cEvs = _e.target.hasEventListener('click')
            var pdEvs = _e.target.hasEventListener('pointerdown')
            var peCss = sk.utils.cssVar('pointer-events')
            if (mdEvs || tsEvs || cEvs || pdEvs){
                //if (!isDisabled && peCss !== 'none' && _e.target.id !== this.uuid && _e.target.id !== this.content.uuid) return
            }
            


            this.mdPos = sk.interactions.getPos(_e, true, this.rect)

            this.scroller.vel = { x: 0, y: 0 };

           
            this.element.addEventListener('mousemove', this.handleMouseMoveFromElement);
            this.element.addEventListener('touchmove', this.handleMouseMoveFromElement);

            window.addEventListener('mouseup', this.handleMouseUp);
            window.addEventListener('touchend', this.handleMouseUp);
        }

        // In your mouse/touch events:
        this.element.addEventListener('mousedown', this.handleMouseDown);
        //this.element.addEventListener('pointerdown', this.handleMouseDown);
        this.element.addEventListener('touchstart', this.handleMouseDown);
        

        this.scrollbars = {
            x: this.add.iceRink_scrollbar(_c => {
                _c.onBeginScrolling = ()=>{
                    this.scroller.tweenX.speed = 10000
                }

                _c.onScrolling = pos => {
                    var mapped = sk.utils.map(pos, 0, 1, 0, this.scroller.contentWidth - this.scroller.viewportWidth)
                    this.scrollTo(0-mapped, null, false)
                }
                
                _c.onEndScrolling = ()=>{
                    this.scroller.tweenX.speed = 10
                }
            }),

            y: this.add.iceRink_scrollbar(_c => {
                _c.vertical = true

                _c.onBeginScrolling = ()=>{
                    this.scroller.tweenY.speed = 10000
                }
                
                _c.onScrolling = pos => {
                    var mapped = sk.utils.map(pos, 0, 1, 0, this.scroller.contentHeight - this.scroller.viewportHeight)
                    this.scrollTo(null, 0-mapped, false)
                }

                _c.onEndScrolling = ()=>{
                    this.scroller.tweenY.speed = 10
                }
            })
        }


        requestAnimationFrame(() => this._tick())


        this.attributes.add({friendlyName: 'Hide Overflow', name: 'hideOverflow', type: 'bool', onSet: val => {
            if (val){
                this.style.overflow = ''
                this.contentWrapper.style.overflow = ''
                this.content.style.overflow = ''
            } else {                
                this.style.overflow = 'unset'
                this.contentWrapper.style.overflow = 'unset'
                this.content.style.overflow = 'unset'
            }
        }})
        this.__hideOverflow = true

        this.hideOverflow = true

        this.attributes.add({friendlyName: 'Instant', name: 'instant', type: 'bool', onSet: val => {
            if (val) this.scrollTo(this.scrollPos.x, this.scrollPos.y, true)
        }})
        this.__instant = false

        this.attributes.add({friendlyName: 'Scroll X', name: 'scrollX', type: 'number',
            onSet: val => { this.scrollTo(val, null, !this.instant) },
            onGet: ()=>{ return this.scrollPos.x }
        })

        this.attributes.add({friendlyName: 'Scroll Y', name: 'scrollY', type: 'number',
            onSet: val => { this.scrollTo(null, val, !this.instant) },
            onGet: ()=>{ return this.scrollPos.x }
        })

        this.attributes.add({friendlyName: 'Max Overscroll X', name: 'maxOverscrollX', type: 'number',
            onSet: val => { this.scroller.overshootX = val },
            onGet: ()=>{ return this.scroller.overshootX }
        })

         this.attributes.add({friendlyName: 'Max Overscroll Y', name: 'maxOverscrollY', type: 'number',
            onSet: val => { this.scroller.overshootY = val },
            onGet: ()=>{ return this.scroller.overshootY }
        })







        var observer = new ResizeObserver(()=>{
            if (!this.content) return

            const contentRect = this.content.rect
            const width  = contentRect.width
            const height = contentRect.height

            if (this.autoWidth) this.width   = width 
            if (this.autoHeight) this.height = height 
        }).observe(this.content.element)


        this.attributes.add({friendlyName: 'Auto Size', name: 'autoSize', type: 'bool',
            onSet: val => {
                this.autoWidth = val
                this.autoHeight = val
            }
        })

        this.attributes.add({friendlyName: 'Auto Width', name: 'autoWidth', type: 'bool'})

        this.attributes.add({friendlyName: 'Auto Height', name: 'autoHeight', type: 'bool'})

        //Notify deprecated functions and attributes
        


        this.attributes.add({friendlyName: 'Disable X', name: 'disable_x', type: 'bool',
            onSet: val => {this.__notifyDeprecatedAttr('disable_x') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('disable_x') }
        })
        
        
        this.attributes.add({friendlyName: 'Hide handle X', name: 'hideHandleX', type: 'bool',
            onSet: val => { this.__notifyDeprecatedAttr('hideHandleX') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('hideHandleX') }
        })

        


        this.attributes.add({friendlyName: 'Disable Y', name: 'disable_y', type: 'bool',
            onSet: val => { this.__notifyDeprecatedAttr('disable_y') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('disable_y') }
        })
        

        this.attributes.add({friendlyName: 'Hide handle Y', name: 'hideHandleY', type: 'bool', 
            onSet: val => { this.__notifyDeprecatedAttr('hideHandleY') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('hideHandleY') }
        })

     
        
    }

    __notifyDeprecated(name, msg, isFunc){
        var msg = `Deprecated ${(isFunc ? 'function' : 'attribute')} ${name} . ${(msg ? msg : '')}.`
        alert(msg)
        throw msg
    }

    __notifyDeprecatedAttr(name, msg){
        this.__notifyDeprecated(name, msg)
    }

    __notifyDeprecatedFunc(name, msg){
        this.__notifyDeprecated(name, msg, true)
    }

    _tick(){
        this.scroller.updateSize(this.contentWrapper.rect.width, this.contentWrapper.rect.height, this.content.rect.width, this.content.rect.height);

       
        this.content.style.left = this.scrollPos.x + 'px'
        this.content.style.top = this.scrollPos.y + 'px'

        //this.content.style.transform = `translate(${this.scrollPos.x}px, ${this.scrollPos.y}px)`

        this.scrollbars.x.position = sk.utils.map(0-this.scrollPos.x, 0, this.scroller.contentWidth - this.scroller.viewportWidth, 0, 1)
        this.scrollbars.y.position = sk.utils.map(0-this.scrollPos.y, 0, this.scroller.contentHeight - this.scroller.viewportHeight, 0, 1)

        
        this.scrollbars.x.updateHandleSize(this.scroller.contentWidth)
        this.scrollbars.y.updateHandleSize(this.scroller.contentHeight)
        
        if (this.scroller.contentWidth <= this.scroller.viewportWidth) this.hideScrollbar('x')
        else this.showScrollbar('x')

        if (this.scroller.contentHeight <= this.scroller.viewportHeight) this.hideScrollbar('y')
        else this.showScrollbar('y')


         if (this.onOverscroll){
            var diff = {
                x: this.scroller.contentWidth - this.contentWrapper.rect.width,
                y: this.scroller.contentHeight - this.contentWrapper.rect.height
            }

            var overscrolls = {
                left: 0-this.scrollPos.x,
                right: 0-(diff.x - this.scrollPos.x),                
                top: 0-this.scrollPos.y,
                bottom: 0-(diff.y - this.scrollPos.y)
            }

            var overscroll = {x: 0, y: 0}
            if (overscrolls.left > 0) overscroll.x = overscrolls.left
            if (overscrolls.top > 0) overscroll.y = overscrolls.top
            
            if (overscroll.x !== this.lastOverscrollVal.x || overscroll.y !== this.lastOverscrollVal.y) this.onOverscroll(overscroll)

            this.lastOverscrollVal.x = overscroll.x
            this.lastOverscrollVal.y = overscroll.y
        }




        requestAnimationFrame(() => this._tick())
    }


    scrollToChild(child, center = true, animate = true){
        var offset = {x: 0, y: 0}

        if (center) offset = {
            x: this.rect.width / 2 - child.rect.width / 2,
            y: this.rect.height / 2 - child.rect.height / 2
        }

        var childPos = {
            x: child.rect.localPos.x - offset.x,
            y: child.rect.localPos.y - offset.y,
        }

        this.scroller.scrollTo(0-childPos.x, 0-childPos.y, animate)
    }

    scrollTo(x, y, animate = true, usePercent = false){
        var _animate = animate
        if (this.instant) _animate = false

        this.scroller.scrollTo(x, y, _animate, usePercent)
    }

    includeComponent(component){
        this.__includedComponents.push(component)
        
        component.element.addEventListener('wheel', this.handleMouseWheel)
        component.element.addEventListener('mousedown', this.handleMouseDown)
        component.element.addEventListener('touchstart', this.handleMouseDown)
    }

    showScrollbar(axis){
        var scrollbar = this.scrollbars[axis]
        var isVisible = scrollbar.visible
        if (isVisible) return

        this.scrollbars[axis].show()

        if (this.scrollbars.x.visible && this.scrollbars.y.visible){
            if (!this.scrollbars.x.hidden) this.scrollbars.x.style.width = 'calc(100% - 12px)'
            if (!this.scrollbars.y.hidden) this.scrollbars.y.style.height = 'calc(100% - 12px)'
            
            if (!this.scrollbars.x.hidden) this.contentWrapper.style.width = 'calc(100% - 12px)'
            if (!this.scrollbars.y.hidden) this.contentWrapper.style.height = 'calc(100% - 12px)'
        }
    }

    hideScrollbar(axis){
        var scrollbar = this.scrollbars[axis]
        var isVisible = scrollbar.visible

        var rect = scrollbar.rect

        if (!isVisible) return
        
        this.scrollbars[axis].hide()

        this.scrollbars.x.style.width = ''
        this.scrollbars.y.style.height = ''

        if (!this.scrollbars.x.visible){
            this.contentWrapper.style.height = ''
        }

        if (!this.scrollbars.y.visible){
            this.contentWrapper.style.width = ''
        }
    }
}