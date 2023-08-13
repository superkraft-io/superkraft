class sk_ui_iceRink extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.vertical = false
        this.compact = true


        
        var wheelMS = Date.now()
        var wheelInertia = {x: 0, y: 0}
        this.onWheel = _e => {
            if (this.getParentIceRink()){
                _e.preventDefault()
                _e.stopPropagation()
            }

            //if (this.scrollbarY_native.element.scrollTop + _e.deltaY < this.content.storedHeight && this.content.storedHeight === 0) return

            //_e.preventDefault()
            //_e.stopPropagation()

            this.scrollerX.dictator = 'wheel_or_touchpad'
            this.scrollerY.dictator = 'wheel_or_touchpad'

            var factor = 0.3

            wheelInertia.x += _e.deltaX * factor
            wheelInertia.y += _e.deltaY * factor
            
            var msDiff = Date.now() - wheelMS
            if (msDiff > 50){
                this.scrollerX.setInertia(wheelInertia.x, true)
                this.scrollerY.setInertia(wheelInertia.y, true)
                wheelMS = Date.now()
                wheelInertia.x = 0
                wheelInertia.y = 0
            }

            
            this.tweenX.stop()
            this.tweenY.stop()
        }
        
        this.scrollbarX_wrapper = this.add.component(_c => {
            _c.styling = 'top left'
            _c.animate = false
            _c.compact = true
            _c.classAdd('sk_ui_iceRink_scrollbarWrapper sk_ui_iceRink_scrollbarWrapper_x')

            this.scrollbarX_native = _c.add.component(_c => {
                _c.styling = 'top left'
                _c.classAdd('sk_ui_iceRink_native_scrollbar sk_ui_iceRink_native_scrollbar_x')
                _c.animate = false
                _c.fakeContent = _c.add.component(_c => {
                    _c.classAdd('sk_ui_iceRink_native_scrollbar_fakeContent')
                    _c.animate = false
                })

                _c.element.addEventListener('scroll', _e => {
                    if (!_c.dragging) return
                    var scrollPos = _c.fakeContent.rect.left - _c.rect.left
                    this.scrollerX.value = scrollPos
                })

                
                _c.element.addEventListener('mousedown', _e => {
                    _c.dragging = true
                    this.scrollerX.stop()
                })

                _c.element.addEventListener('mouseup', _e => {
                    _c.dragging = false
                    this.scrollerX.start()
                })

                
                _c.element.addEventListener('wheel', this.onWheel)
            })

            _c.updatePosition = contentWrapperRect => {
                if (this.scrollbarX.decoupled && this.onWrapperResized) return this.onWrapperResized(contentWrapperRect)
        
                var left = contentWrapperRect.left - this.parent.rect.left + this.scrollbarX.offset.left
                _c.style.left = left + 'px'

                if (this.scrollbarX.decoupled){
                    _c.style.bottom = (this.scrollbarX.decoupled === 'outside' ? '-10px' : '0px')
                } else {
                    _c.style.top = this.content.rect.top + (this.content.storedHeight - _c.rect.height + this.scrollbarX.offset.bottom) + 'px'
                }
                _c.style.width = (contentWrapperRect.width - this.scrollbarX.offset.right - this.scrollbarX.offset.left) + 'px'
            }
        })



        this.scrollbarY_wrapper = this.add.component(_c => {
            _c.styling = 'top left'
            _c.animate = false
            _c.compact = true
            _c.classAdd('sk_ui_iceRink_scrollbarWrapper sk_ui_iceRink_scrollbarWrapper_y')

            this.scrollbarY_native = _c.add.component(_c => {
                _c.styling = 'top left'
                _c.classAdd('sk_ui_iceRink_native_scrollbar sk_ui_iceRink_native_scrollbar_y')
                _c.animate = false
                _c.fakeContent = _c.add.component(_c => {
                    _c.classAdd('sk_ui_iceRink_native_scrollbar_fakeContent')
                    _c.animate = false
                })

                _c.element.addEventListener('scroll', _e => {
                    if (!_c.dragging) return
                    var scrollPos = _c.fakeContent.rect.top - _c.rect.top
                    this.scrollerY.value = scrollPos
                })

                
                _c.element.addEventListener('mousedown', _e => {
                    _c.dragging = true
                    this.scrollerY.stop()
                })

                _c.element.addEventListener('mouseup', _e => {
                    _c.dragging = false
                    this.scrollerY.start()
                })

                
                _c.element.addEventListener('wheel', this.onWheel)
            })

            _c.updatePosition = contentWrapperRect => {
                if (this.scrollbarY.decoupled && this.onWrapperResized) return this.onWrapperResized(contentWrapperRect)
        
                var top = contentWrapperRect.top - this.parent.rect.top + this.scrollbarY.offset.top
                _c.style.top = top + 'px'

                if (this.scrollbarY.decoupled){
                    _c.style.right = (this.scrollbarY.decoupled === 'outside' ? '-10px' : '0px')
                } else {
                    _c.style.left = this.content.rect.left + (this.content.storedWidth - _c.rect.width + this.scrollbarY.offset.right) + 'px'
                }
                _c.style.height = (contentWrapperRect.height - this.scrollbarY.offset.bottom - this.scrollbarY.offset.top) + 'px'
            }
        })





        this.contentWrapper = this.add.component(_c => {
            _c.classAdd('sk_ui_iceRink_contentWrapper')
            _c.styling = 'top center fullwidth fullheight'
            _c.moveBefore(this.scrollbarX_wrapper)
            _c.compact = true


            this.content = _c.add.component(_c => {
                _c.classAdd('sk_ui_iceRink_content')
                
                _c.styling = 'top center'
                _c.animate = false

                
                this.add = _c.add

                _c.last_pos = {x: 0, y: 0}

                var observer = new ResizeObserver(()=>{
                    var cRect = _c.rect
                    
                    //account for padding and margin
                    var getCSSVal = prop => {
                        var val = 0
                        try { val = parseFloat(getComputedStyle(_c.element).getPropertyValue(prop)) } catch(err) {}
                        return  val
                    }


                    if (this.axis.indexOf('x') > -1){
                        cRect.width += getCSSVal('padding-left') + getCSSVal('padding-right')
                        this.scrollbarX_native.fakeContent.style.minWidth = cRect.width + 'px'
                        this.content.storedWidth = cRect.width
                        this.scrollerX.contentSize = cRect.width
                        this.scrollbarX.updateDimensions()
                        this.scrollbarX_wrapper.updatePosition(this.contentWrapper.rect)
                        if (this.autoWidth) this.contentWrapper.style.width = cRect.width + 'px'
                    }


                    if (this.axis.indexOf('y') > -1){
                        cRect.height += getCSSVal('padding-top') + getCSSVal('padding-bottom')
                        this.scrollbarY_native.fakeContent.style.minHeight = cRect.height + 'px'
                        this.content.storedHeight = cRect.height
                        this.scrollerY.contentSize = cRect.height
                        this.scrollbarY.updateDimensions()
                        this.scrollbarY_wrapper.updatePosition(this.contentWrapper.rect)
                        if (this.autoHeight) this.contentWrapper.style.height = cRect.height + 'px'
                    }
                    
                }).observe(_c.element)




                _c.posX = 0
                _c.posY = 0
                this.setContentPos = val => {
                    if (val.x){
                        this.preRubberbandPos.x = val.x
                        _c.posX = val.x
                        this.scrollbarY_native.element.scrollLeft = 0-val.x
                    }

                    if (val.y){
                        this.preRubberbandPos.y = val.y
                        _c.posY = val.y
                        this.scrollbarY_native.element.scrollTop = 0-val.y
                    }

                    _c.style.transform = `translate(${Math.floor(_c.posX)}px, ${Math.floor(_c.posY)}px)`

                    
                    if (this.onScroll) this.onScroll({x: _c.posX, y: _c.posY})
                }
            })
            

            

            _c.element.addEventListener('wheel', this.onWheel)




            
            let pos = { top: 0, left: 0, x: 0, y: 0 };

            
            var direction = {x: '', y: ''}
            var movPos = {x: 0, y: 0}
            var currPos = undefined
            var velocity = {x: '', y: ''}
          
            var resetVelocityTimer = {
                x: undefined,
                y: undefined
            }

            var lastMS = Date.now()
            var calcVelocity = ()=>{
                velocity.x = currPos.x - movPos.x
                velocity.y = currPos.y - movPos.y

                clearTimeout(resetVelocityTimer.x)
                clearTimeout(resetVelocityTimer.x)

                var delay = {
                    x: (velocity.x > 0 ? velocity.x : 0-velocity.x),
                    y: (velocity.y > 0 ? velocity.y : 0-velocity.y)
                }
                //delay = Math.round(delay/4)
                delay = {
                    x: Math.round(25),
                    y: Math.round(25)
                }
                
                resetVelocityTimer.x = setTimeout(()=>{ velocity.x = 0 }, delay.x)
                resetVelocityTimer.y = setTimeout(()=>{ velocity.y = 0 }, delay.y)
            }



            const mouseMoveHandler = _e => {
                _e.preventDefault()
                _e.stopPropagation()

                var x = (_e.clientX || _e.touches[0].clientX)
                var y = (_e.clientY || _e.touches[0].clientY)
                const dx = x - pos.x
                const dy = y - pos.y

                
                var delta = {
                    x: (dx < 0 ? 0-dx : dx),
                    y: (dy < 0 ? 0-dy : dy)
                }
                if (delta.x < 3 && delta.y < 3) return 


                if (delta.x > 10 || delta.y > 10 ){
                    sk.interactions.block()
                }


                if (dx >= 0) direction.x = 'right'
                else direction.x = 'left'

                if (dy >= 0) direction.y = 'down'
                else direction.y = 'up'

                movPos = {x: x, y: y}
                if (!currPos) currPos = {x: x, y: y}

                var msDiff = Date.now() - lastMS
                if (msDiff > 300){
                    lastMS = Date.now()
                    currPos = {x: x, y: y}
                    
                }

                calcVelocity()
                
                

                if (this.axis.indexOf('x') > -1) this.scrollerX.value = this.content.last_pos.x + dx
                if (this.axis.indexOf('y') > -1) this.scrollerY.value = this.content.last_pos.y + dy
            }

            const mouseUpHandler = _e => {
                //console.log('icerink MOUSE UP')
                //_e.preventDefault()
                //_e.stopPropagation()
                
                pos = undefined

                sk.interactions.unblock()

                //this.content.style.pointerEvents = ''

                _c.element.removeEventListener('mousemove', mouseMoveHandler)
                document.removeEventListener('mousemove', mouseMoveHandler)

                _c.element.removeEventListener('mouseup', mouseUpHandler)
                document.removeEventListener('mouseup', mouseUpHandler)


                _c.element.removeEventListener('touchmove', mouseMoveHandler)
                document.removeEventListener('touchmove', mouseMoveHandler)

                _c.element.removeEventListener('touchend', mouseUpHandler)
                document.removeEventListener('touchend', mouseUpHandler)
            

                this.__includedComponents.forEach(_c => {
                    _c.element.removeEventListener('mousemove', mouseMoveHandler)
                    _c.element.removeEventListener('mouseup', mouseUpHandler)
                    _c.element.removeEventListener('touchmove', mouseMoveHandler)
                    _c.element.removeEventListener('touchend', mouseUpHandler)
                })

                _c.element.style.cursor = ''
                _c.element.style.removeProperty('user-select')

                if (this.axis.indexOf('x') > -1){
                    if (velocity.x !== 0) this.scrollerX.inertia = velocity.x
                    this.scrollerX.value = this.preRubberbandPos.x
                    this.scrollerX.start()
                }

                if (this.axis.indexOf('y') > -1){
                    if (velocity.y !== 0) this.scrollerY.inertia = velocity.y
                    this.scrollerY.value = this.preRubberbandPos.y
                    this.scrollerY.start()
                }
            }



            this.mouseDownHandler = _e => {
                if (this.getPath({target: _e.target})[0].tagName.toLowerCase() === 'input') return

                if (this.getParentIceRink()){
                    _e.preventDefault()
                    _e.stopPropagation()
                }

                this.scrollerX.dictator = 'mouse_or_finger'
                this.scrollerY.dictator = 'mouse_or_finger'

                pos = {
                    left: this.scrollbarY_native.element.scrollLeft,
                    top: this.scrollbarY_native.element.scrollTop,
                    x: (_e.clientX || _e.touches[0].clientX),
                    y: (_e.clientY || _e.touches[0].clientY),
                }

                _c.element.addEventListener('mousemove', mouseMoveHandler)
                document.addEventListener('mousemove', mouseMoveHandler)

                
                _c.element.addEventListener('mouseup', mouseUpHandler)
                document.addEventListener('mouseup', mouseUpHandler)


                _c.element.addEventListener('touchmove', mouseMoveHandler)
                //document.addEventListener('touchmove', mouseUpHandler)

                _c.element.addEventListener('touchend', mouseUpHandler)
                document.addEventListener('touchend', mouseUpHandler)
                

                this.__includedComponents.forEach(_c => {
                    _c.element.addEventListener('mousemove', mouseMoveHandler)
                    _c.element.addEventListener('mouseup', mouseUpHandler)
                    _c.element.addEventListener('touchmove', mouseMoveHandler)
                    _c.element.addEventListener('touchend', mouseUpHandler)
                })


                if (this.axis.indexOf('x') > -1){
                    this.scrollerX.stop()
                    this.content.last_pos.x = this.scrollerX.__value
                }
                
                if (this.axis.indexOf('y') > -1){
                    this.scrollerY.stop()
                    this.content.last_pos.y = this.scrollerY.__value
                }

                if (!this.canScroll) return
                _c.element.style.cursor = 'grabbing'
                _c.element.style.userSelect = 'none'
            }

            _c.element.addEventListener('mousedown', this.mouseDownHandler)
            _c.element.addEventListener('touchstart', this.mouseDownHandler)
        })

        var observer = new ResizeObserver(()=>{
            var cRect = this.content.rect
            
            this.content.storedWidth = this.rect.width
            this.content.storedHeight = this.rect.height

            if (this.axis.indexOf('x') > -1){
                this.scrollbarX_native.fakeContent.style.minWidth = cRect.width + 'px'
                this.scrollerX.containerSize = this.rect.width
                this.scrollbarX.updateDimensions()
                this.scrollbarX_wrapper.updatePosition(this.contentWrapper.rect)
                try { if (this.element.rect.width >= cRect.width) this.scrollX = 0 } catch(err) {}
            }

            if (this.axis.indexOf('y') > -1){
                this.scrollbarY_native.fakeContent.style.minHeight = cRect.height + 'px'
                this.scrollerY.containerSize = this.rect.height
                this.scrollbarY.updateDimensions()
                this.scrollbarY_wrapper.updatePosition(this.contentWrapper.rect)
                try { if (this.element.rect.height >= cRect.height) this.scrollY = 0 } catch(err) {}
            }

        }).observe(this.element)


        this.scrollbarX = this.scrollbarX_wrapper.add.fromNew(sk_ui_iceRink_scrollbar, _c => {
            _c.orientation = 'horizontal'
            _c.wrapper = this.contentWrapper
            _c.content = this.content

            _c.onWheel = _e => {
                //this.scrollbarY_native.element.scrollTop += _e.deltaY
            }

            _c.onShow = ()=>{
                if (this.hideHandleX) return

                this.scrollbarX_wrapper.style.height = (sk.isOnMobile ? '4px' : 'var(--sk_ui_scrollbar_width)')
                this.scrollbarX_wrapper.style.opacity = 1
                this.canScroll = true
            }

            _c.onHide = (canScroll = false)=>{
                this.scrollbarX_wrapper.style.height = '0px'
                this.scrollbarX_wrapper.style.opacity = 0
                this.canScroll = canScroll
            }

            _c.onDecoupled = decoupled => {
                if (decoupled && !this.hideHandleX){
                    this.scrollbarX_wrapper.style.top = ''
                    this.scrollbarX_wrapper.style.bottom = (decoupled === 'outside' ? '-10px' : '0px')
                } else {
                    this.scrollbarX_wrapper.style.bottom = ''
                }
            }
        })


        this.scrollbarY = this.scrollbarY_wrapper.add.fromNew(sk_ui_iceRink_scrollbar, _c => {
            _c.wrapper = this.contentWrapper
            _c.content = this.content
            _c.onWheel = _e => {
                //this.scrollbarY_native.element.scrollTop += _e.deltaY
            }

            _c.onShow = ()=>{
                if (this.hideHandleY) return

                this.scrollbarY_wrapper.style.width = (sk.isOnMobile ? '4px' : 'var(--sk_ui_scrollbar_width)')
                this.scrollbarY_wrapper.style.opacity = 1
                this.canScroll = true
            }

            _c.onHide = (canScroll = false)=>{
                this.scrollbarY_wrapper.style.width = '0px'
                this.scrollbarY_wrapper.style.opacity = 0
                this.canScroll = canScroll
            }

            _c.onDecoupled = decoupled => {
                if (decoupled && !this.hideHandleY){
                    this.scrollbarY_wrapper.style.left = ''
                    this.scrollbarY_wrapper.style.right = (decoupled === 'outside' ? '-10px' : '0px')
                } else {
                    this.scrollbarY_wrapper.style.right = ''
                }
            }
        })


        /****/
        
        
        var updateHandleLeftPos = val => {
            var diff = this.content.rect.width - this.contentWrapper.rect.width
            var scrollPercent = val / diff
            
            this.scrollbarX.setLeft(scrollPercent)

        }


        var updateHandleTopPos = val => {
            var diff = this.content.rect.height - this.contentWrapper.rect.height
            var scrollPercent = val / diff
            
            this.scrollbarY.setTop(scrollPercent)
        }




        /*******/


        this.tweenX = new SK_Tween({
            speed: 10,
            onChanged: res => {
                this.scrollerX.value = res.current
            }
        })

        this.tweenY = new SK_Tween({
            speed: 10,
            onChanged: res => {
                this.scrollerY.value = res.current
            }
        })


        this.lastScrollValue = {x: 0, y: 0}
        var lastOverscrollVal = {x: 0, y: 0}
        this.preRubberbandPos = {x: 0, y: 0}

        this.scrollerX = new sk_scroller({parent: this,
            orientation: 'horizontal',

            onStep: ()=>{
                this.tweenX.step()
            },

            onStop: ()=>{
                this.tweenX.stop()
            },

            onChanged: res => {
                if (this.maxOverscrollX !== undefined){
                    if (res > 0) res = 0
                    if (res < 0-this.content.rect.width + this.rect.width) res = 0-this.content.rect.width + this.rect.width
                }
               
                if (this.content.rect.width <  this.contentWrapper.rect.width) res = 0
                
                if (this.lastScrollValue.x === res) return
                this.lastScrollValue.x = res


                
                
                if (this.onOverscroll){
                    var diff = this.content.storedWidth - this.storedWidth

                    var overscrolls = {
                        top: 0-res,
                        bottom: 0-(diff - res)
                    }

                    var overscroll = 0
                    if (overscrolls.left > 0) overscroll = overscrolls.left
                    
                    if (overscroll !== lastOverscrollVal.x) this.onOverscroll(overscroll)
                    lastOverscrollVal.x = overscroll
                }

                this.setContentPos({x: res})
                updateHandleLeftPos(0-res)
            }
        })


        this.scrollerY = new sk_scroller({parent: this,
            onStep: ()=>{
                this.tweenY.step()
            },

            onStop: ()=>{
                this.tweenY.stop()
            },

            onChanged: res => {
                if (this.maxOverscrollY !== undefined){
                    if (res > 0) res = 0
                    if (res < 0-this.content.rect.height + this.rect.height) res = 0-this.content.rect.height + this.rect.height
                }

                if (this.content.rect.height < this.contentWrapper.rect.height) res = 0

                if (this.lastScrollValue.y === res) return
                this.lastScrollValue.y = res


                
                
                if (this.onOverscroll){
                    var diff = this.content.storedHeight - this.storedHeight

                    var overscrolls = {
                        top: 0-res,
                        bottom: 0-(diff - res)
                    }

                    var overscroll = 0
                    if (overscrolls.top > 0) overscroll = overscrolls.top
                    //if (overscrolls.top < 0 && overscrolls.bottom < 0) overscroll = overscrolls.bottom
                    if (overscroll !== lastOverscrollVal.y) this.onOverscroll(overscroll)
                    lastOverscrollVal.y = overscroll
                }
                
                this.setContentPos({y: res})
                updateHandleTopPos(0-res)
            }
        })


        this.attributes.add({friendlyName: 'Instant', name: 'instant', type: 'bool', onSet: val => {
            this.setContentPos({x: this.tweenX.current})
            updateHandleLeftPos(0-this.tweenX.current)
        }})

        this.attributes.add({friendlyName: 'Hide Overflow', name: 'hideOverflow', type: 'bool', onSet: val => {
            this.contentWrapper.style.overflow = (val ? 'hidden' : '')
        }})





        this.axis = 'xy'


        this.attributes.add({friendlyName: 'Max Overscroll X', name: 'maxOverscrollX', type: 'number'})
        
        this.attributes.add({friendlyName: 'Hide handle X', name: 'hideHandleX', type: 'bool', onSet: val => {
            if (!val) return
            this.scrollbarX_wrapper.style.height = '0px'
            this.scrollbarX_wrapper.style.opacity = 0
        }})

        this.attributes.add({friendlyName: 'Auto Width', name: 'autoWidth', type: 'bool', onSet: val => {
            this.contentWrapper.styling = `top center ${(!val ? 'fullwidth' : '')} ${(!this.autoHeight ? 'fullheight' : '')}`
        }})



        
      
        this.attributes.add({friendlyName: 'Max Overscroll Y', name: 'maxOverscrollY', type: 'number'})

        this.attributes.add({friendlyName: 'Hide handle Y', name: 'hideHandleY', type: 'bool', onSet: val => {
            if (!val) return
            this.scrollbarY_wrapper.style.width = '0px'
            this.scrollbarY_wrapper.style.opacity = 0
        }})

     
        this.attributes.add({friendlyName: 'Auto Height', name: 'autoHeight', type: 'bool', onSet: val => {
            this.contentWrapper.styling = `top center ${(!this.autoWidth ? 'center' : '')} ${(!val ? 'fullheight' : '')}`
        }})




        this.attributes.add({friendlyName: 'Scroll X', name: 'scrollX', type: 'number',
            onSet: val => {
                this.content.last_pos.x = val
                this.tweenX.last = val
                this.tweenX.current = val
                this.scrollerX.value = val
                this.lastScrollValue.x = val
                this.preRubberbandPos.x = val

                if (this.instant){
                    
                    if (this.maxOverscrollX !== undefined){
                        if (val > 0) val = 0
                        if (val < 0-this.content.rect.width + this.rect.width) val = 0-this.content.rect.width + this.rect.width
                    }
                    
                    this.setContentPos({x: val})
                    updateHandleLeftPos(0-val)
                    return 
                }
                
                this.tweenX.to(val)
            },

            onGet: ()=>{
                return this.content.posX
            }
        })

        this.attributes.add({friendlyName: 'Scroll Y', name: 'scrollY', type: 'number',
            onSet: val => {
                if (this.instant){
                    
                    if (this.maxOverscrollY !== undefined){
                        if (val > 0) val = 0
                        if (val < 0-this.content.rect.height + this.rect.height) val = 0-this.content.rect.height + this.rect.height
                    }
                
                    this.tweenY.current = val
                    this.setContentPos({y: val})
                    updateHandleLeftPos(0-val)
                    return 
                }
                this.tweenY.current = this.preRubberbandPos.y
                this.tweenY.to(val)
            },

            onGet: ()=>{
                return this.content.posY
            }
        })

        this.__includedComponents = []
    }

    scrollToChild(component, center){
        var offset = {x: 0, y: 0}

        if (center) offset = {
            x: this.contentWrapper.rect.width / 2 - component.rect.width / 2,
            y: this.contentWrapper.rect.height / 2 - component.rect.height / 2
        }

        var doAxis = axis => {
            var axisUC = axis.toUpperCase()
            
            this['last' + axisUC + 'Pos'] = this['scroller' + axisUC].value
            this['tween' + axisUC].current = this['last' + axisUC + 'Pos']
            var cRect = component.rect
            var newVal = 0-((0-this['last' + axisUC + 'Pos']) + cRect.localPos[axis]) + offset[axis]
            this['tween' + axisUC].to(newVal)
        }
        
        doAxis('x')
        doAxis('y')
    }

    scrollTo(val){
        this.tweenY.current = this.preRubberbandPos.y
        this.tweenY.to(val)
    }

    includeComponent(component){
        /*component.element.removeEventListener('wheel', component.onWheel)
        component.element.removeEventListener('mousedown', component.mouseDownHandler)
        component.element.removeEventListener('touchstart', component.mouseDownHandler)
        */

        this.__includedComponents.push(component)
        
        component.element.addEventListener('wheel', this.onWheel)
        component.element.addEventListener('mousedown', this.mouseDownHandler)
        component.element.addEventListener('touchstart', this.mouseDownHandler)
    }

    set debug(val){
        this.__debug = true
        this.scrollerY.__debug = true
    }
}

class sk_ui_iceRink_scrollbar extends sk_ui_component {
    constructor(opt){
        super(opt)

        
        this.styling = 'top left'
        this.animate = false

        this.width = 0
        this.height = 0
        this.backgroundColor = (sk.isOnMobile ? '' : 'var(--sk_ui_color_scrollbar_track)')

        this.offset = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        }

        this.handle = this.add.component(_c => {
            _c.classAdd('sk_ui_iceRink_scrollbar_handle')
            _c.animate = false
        })

        this.element.addEventListener('wheel', _e => {
            this.onWheel(_e)
        })


        this.getSizeDiff = (a, b)=>{
            var tRect = a.rect
            var cRect = b.rect

            if (this.orientation === 'horizontal'){
                if (tRect.width < cRect.width) return tRect.width / cRect.width
            } else {
                if (tRect.height < cRect.height) return tRect.height / cRect.height
            }

            return 1
        }

        this.attributes.add({friendlyName: 'Decoupled', name: 'decoupled', type: 'bool', onSet: val => {
            if (this.onDecoupled) this.onDecoupled(val)
        }})

        this.attributes.add({friendlyName: 'Hidden', name: 'hidden', type: 'bool', onSet: val => { }})

        this.orientation = 'vertical'
    }


    set orientation(val){
        this.__orientation = val
        
        this.handle.classRemove('sk_ui_iceRink_scrollbar_handle_x')
        this.handle.classRemove('sk_ui_iceRink_scrollbar_handle_y')

        this.handle.classAdd('sk_ui_iceRink_scrollbar_handle_' + (val === 'vertical' ? 'y' : 'x'))
    }

    get orientation(){ return this.__orientation }

    
    setLeft(val){
        var thisWidth = this.rect.width
        var handleWidth = this.handle.rect.width

        var diff = thisWidth - handleWidth

        var left = diff * val

        this.left = left

        
        
        if (left < 0) left = 0
        if (left > diff) left = diff

        this.handle.style.left = left + 'px'

        this.updateDimensions()
    }


    setTop(val){
        var thisHeight = this.rect.height
        var handleHeight = this.handle.rect.height

        var diff = thisHeight - handleHeight

        var top = diff * val

        this.top = top

        
        
        if (top < 0) top = 0
        if (top > diff) top = diff

        this.handle.style.top = top + 'px'

        this.updateDimensions()
    }

    updateDimensions(){
        this['updateDimensionsFor_' + this.__orientation]()
    }


    updateDimensionsFor_horizontal(){
        var widthRatio = this.getSizeDiff(this.wrapper, this.content)

        var handleSize = 100 * widthRatio



        
        var diff = this.rect.width - this.handle.rect.width
        var distanceFromRight = 0 - (diff - this.left)

        var factor = 7
        var overscrolls = {
            top: this.left / factor,
            bottom: 0-(distanceFromRight / factor)
        }

        var overscroll = 0
        if (this.left < 0) overscroll = overscrolls.left
        if (distanceFromRight > 0) overscroll = overscrolls.right

        this.handle.style.width = handleSize + overscroll + '%'

        if (!this.hidden){
            if (handleSize === 100) this.onHide()
            else this.onShow()
        }
    }

    updateDimensionsFor_vertical(){
        var heightRatio = this.getSizeDiff(this.wrapper, this.content)
        if (heightRatio === 0) return

        var handleSize = 100 * heightRatio



        
        var diff = this.rect.height - this.handle.rect.height
        var distanceFromBottom = 0 - (diff - this.top)

        var factor = 7
        var overscrolls = {
            top: this.top / factor,
            bottom: 0-(distanceFromBottom / factor)
        }

        var overscroll = 0
        if (this.top < 0) overscroll = overscrolls.top
        if (distanceFromBottom > 0) overscroll = overscrolls.bottom

        this.handle.style.height = handleSize + overscroll + '%'

        console.log(handleSize)

        if (handleSize === 100) this.onHide()
        else this.onShow()  
    }
}

class sk_scroller {
    constructor(opt){
        this.opt = opt

        this.orientation = opt.orientation || 'vertical'
        if (this.orientation !== 'horizontal' && this.orientation !== 'vertical') console.error('Invalid orientation: ' + opt.orientation)

        this.__inertia = 0
        this.__friction = 1

        this.__value = 0

        this.__run = true
        this.springConstant = 0.5

        var step = async _ts => {
            if (this.__run){
                //await sk.utils.sleep(100)
                this.step()
            }
            
            if (this.opt.onStep) this.opt.onStep()

            window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)
    }

    calcRubberband(opt){
        return (1.0 - (1.0 / ((opt.distanceFromEdge * this.springConstant / opt.containerSize) + 1.0))) * opt.containerSize
    }

    set value(val){
        this.__value = val
        this.step()
    }

    get value(){
        return this.__value
    }

    setInertia(val, noAdd){
        var formattedVal = (val < 0 ? 0-val : val)
        
        var direction = (this.orientation === 'vertical' ? 'up' : 'left')
        if (val < 0) direction = (this.orientation === 'vertical' ? 'down' : 'right')

        if (this.__direction !== direction) this.__inertia = formattedVal
        else { 
            if (noAdd) this.__inertia = formattedVal
            else this.__inertia += formattedVal
        }

        if (this.__inertia > 700) this.__inertia = 700

        this.__direction = direction
        

    }

    set inertia(val){
        this.setInertia(val)
    }

    debug(obj){
        if (!this.__debug) return
        console.log(obj)
    }



    step(){
        this.__inertia -= this.__friction
        if (this.__inertia < 0){
            this.__inertia = 0
        }

        var diff = this.contentSize - this.containerSize

        
        

        if (diff > 0){
            var factoredInertia = this.__inertia*0.2
            if (this.__direction === (this.orientation === 'vertical' ? 'down' : 'right')) this.__value += factoredInertia
            else this.__value -= factoredInertia
            
            if (!this.ignoreRubberbanding) this.tryApplyRubberbanding()
        } else {
            this.__value = 0
        }

        
        if (this.opt.onChanged) this.opt.onChanged(this.__value)
    }

    start(){
        this.__run = true
    }

    stop(){
        this.__run = false
        this.__inertia = 0
        if (this.opt.onStop) this.opt.onStop()
    }


    tryApplyRubberbanding(){
        var val = this.__value

        

        var diff = this.contentSize - this.containerSize
        
        var distanceFromEdge = 0 - (diff + val)
        if (val < 0 && distanceFromEdge < 0){
            this.isRubberbanding = false
            return 0
        } else {
            this.isRubberbanding = true
            this.__inertia -= 100
        }

        
        

        if (val > 0){
            this.isRubberbanding = true
            this.rubberbandingDirection = (this.orientation === 'vertical' ? 'down' : 'right')

            if (this.dictator === 'mouse_or_finger') this.rubberBandDistance = this.calcRubberband({distanceFromEdge: val, containerSize: this.containerSize})
            else this.rubberBandDistance = 0
            
            val = this.rubberBandDistance
        }



        if (distanceFromEdge > 0){
            this.isRubberbanding = true
            this.rubberbandingDirection = (this.orientation === 'vertical' ? 'up' : 'left')

            if (this.dictator === 'mouse_or_finger') this.rubberBandDistance = this.calcRubberband({distanceFromEdge: distanceFromEdge, containerSize: this.containerSize})
            else this.rubberBandDistance = 0

            val = (0-diff) + (0-this.rubberBandDistance)
        }

        
        
        this.__value = Math.round(val)
    }
}