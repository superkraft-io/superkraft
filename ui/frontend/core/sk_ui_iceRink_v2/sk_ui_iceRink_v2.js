class sk_ui_iceRink_v2 extends sk_ui_component {
    constructor(opt){
        super(opt)
        this.styling = 'left top ttb'
        this.compact = true
        
        this.__includedComponents = []

        this.contentWrapper = this.add.component(_c => {
            _c.classAdd('sk_ui_iceRink_v2_contentWrapper')
            _c.styling = 'left top ttb'
            
            this.content = _c.add.component(_c => {
                _c.classAdd('sk_ui_iceRink_v2_content')
                _c.animate = false
                _c.resizable = true

                var count = 50
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
                }
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


        this.handleMouseWheel =  _e => {
            scroller.handleWheelEvent(_e.deltaX, _e.deltaY)
            
        }

        this.element.addEventListener('wheel', this.handleMouseWheel)

        
        this.handleMouseMove = _e => {
            var pos = sk.interactions.getPos(_e, true, this.rect)
            scroller.updatePosition(pos.x, pos.y)
        }

        this.handleMouseUp = _e => {
            scroller.endDrag()
            window.removeEventListener('mousemove', this.handleMouseMove)
            window.removeEventListener('mouseup', this.handleMouseUp)
            sk.interactions.unblock()
        }



        this.handleMouseDown = _e => {
            if (_e.button !== 0) return;

            var sk_ui_component = _e.target.closest('.sk_ui_component')
            var suo = sk_ui_component.sk_ui_obj
            if (suo) var isDisabled = suo.disabled

            //ensure that we can't trigger drag scrolling from a UI component that already listens to mouse events
            var mdEvs = _e.target.hasEventListener('mousedown')
            var tsEvs = _e.target.hasEventListener('touchstart')
            var cEvs = _e.target.hasEventListener('click')
            var pdEvs = _e.target.hasEventListener('pointerdown')
            var peCss = sk.utils.cssVar('pointer-events')
            if (mdEvs || tsEvs || cEvs || pdEvs){
                if (!isDisabled && peCss !== 'none' && _e.target.id !== this.uuid && _e.target.id !== this.content.uuid) return
            }
            


            var pos = sk.interactions.getPos(_e, true, this.rect)

            sk.interactions.block()

            this.scroller.vel = { x: 0, y: 0 };

            scroller.startDrag(pos.x, pos.y)

            window.addEventListener('mousemove', this.handleMouseMove);
            window.addEventListener('mouseup', this.handleMouseUp);
        }
        // In your mouse/touch events:
        this.element.addEventListener('mousedown', this.handleMouseDown);
        this.element.addEventListener('pointerdown', this.handleMouseDown);

        

        // Optional: touch support
        this.handleTouchMove = _e => {
            if (_e.touches.length === 1) {
                const t = _e.touches[0];
                scroller.updatePosition(t.clientX, t.clientY);
                _e.preventDefault();
            }
        }

        this.handleTouchEnd = _e => {
            scroller.endDrag()
            window.removeEventListener('touchmove', this.handleTouchMove)
            window.removeEventListener('touchend', this.handleTouchEnd)
            sk.interactions.unblock()
        }

        this.element.addEventListener('touchstart', _e => {
            if (_e.touches.length === 1) {
                const t = _e.touches[0];
                sk.interactions.block()
                scroller.startDrag(t.clientX, t.clientY);
                window.addEventListener('mousemove', this.handleTouchMove);
                window.addEventListener('mouseup', this.handleMouseUp);
            }
        });
        this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd);


        this.scrollbars = {
            x: this.add.iceRink_v2_scrollbar(_c => {
                _c.onBeginScrolling = ()=>{
                    this.scroller.tweenX.speed = 10000
                }

                _c.onScrolling = pos => {
                    var mapped = sk.utils.map(pos, 0, 1, 0, this.scroller.contentWidth - this.scroller.viewportWidth)
                    this.scrollTo(0-mapped, null)
                }
                
                _c.onEndScrolling = ()=>{
                    this.scroller.tweenX.speed = 10
                }
            }),

            y: this.add.iceRink_v2_scrollbar(_c => {
                _c.vertical = true

                _c.onBeginScrolling = ()=>{
                    this.scroller.tweenY.speed = 10000
                }
                
                _c.onScrolling = pos => {
                    var mapped = sk.utils.map(pos, 0, 1, 0, this.scroller.contentHeight - this.scroller.viewportHeight)
                    this.scrollTo(null, 0-mapped)
                }

                _c.onEndScrolling = ()=>{
                    this.scroller.tweenY.speed = 10
                }
            })
        }


        requestAnimationFrame(() => this._tick())


        this.attributes.add({friendlyName: 'Hide Overflow', name: 'hideOverflow', type: 'bool', onSet: val => {
            alert('Deprecated attribute ' + hideOverflow)
        }})


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


        //Notify deprecated functions and attributes
        


        this.attributes.add({friendlyName: 'Disable X', name: 'disable_x', type: 'bool',
            onSet: val => { this.__notifyDeprecatedAttr('disable_x') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('disable_x') }
        })
        
        
        this.attributes.add({friendlyName: 'Hide handle X', name: 'hideHandleX', type: 'bool',
            onSet: val => { this.__notifyDeprecatedAttr('hideHandleX') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('hideHandleX') }
        })

        this.attributes.add({friendlyName: 'Auto Width', name: 'autoWidth', type: 'bool',
            onSet: val => { this.__notifyDeprecatedAttr('autoWidth') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('autoWidth') }
        })


        this.attributes.add({friendlyName: 'Disable Y', name: 'disable_y', type: 'bool',
            onSet: val => { this.__notifyDeprecatedAttr('disable_y') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('disable_y') }
        })
        

        this.attributes.add({friendlyName: 'Hide handle Y', name: 'hideHandleY', type: 'bool', 
            onSet: val => { this.__notifyDeprecatedAttr('hideHandleY') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('hideHandleY') }
        })

     
        this.attributes.add({friendlyName: 'Auto Height', name: 'autoHeight', type: 'bool', 
            onSet: val => { this.__notifyDeprecatedAttr('autoHeight') },
            onGet: ()=>{ this.__notifyDeprecatedAttr('autoHeight') }
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

        if (this.scroller.contentWidth <= this.scroller.viewportWidth) this.hideScrollbar('x')
        else this.showScrollbar('x')

        if (this.scroller.contentHeight <= this.scroller.viewportHeight) this.hideScrollbar('y')
        else this.showScrollbar('y')

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
        
        component.element.addEventListener('wheel', this.onWheel)
        component.element.addEventListener('mousedown', this.mouseDownHandler)
        component.element.addEventListener('touchstart', this.mouseDownHandler)
    }

    showScrollbar(axis){
        if (this.scrollbars[axis].visible) return

        this.scrollbars[axis].show()

        if (this.scrollbars.x.visible && this.scrollbars.y.visible){
            this.scrollbars.x.style.width = 'calc(100% - 12px)'
            this.scrollbars.y.style.height = 'calc(100% - 12px)'
            
            this.contentWrapper.style.width = 'calc(100% - 12px)'
            this.contentWrapper.style.height = 'calc(100% - 12px)'
        }
    }

    hideScrollbar(axis){
        if (!this.scrollbars[axis].visible) return
        
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