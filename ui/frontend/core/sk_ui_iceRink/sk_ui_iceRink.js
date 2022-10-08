class sk_ui_iceRink extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.vertical = false
        this.compact = true


        
        var wheelMS = Date.now()
        var wheelInertia = 0
        var onWheel = _e => {
            this.scroller.dictator = 'wheel_or_touchpad'

            var factor = 0.3

            wheelInertia += _e.deltaY * factor
            
            var msDiff = Date.now() - wheelMS
            if (msDiff > 50){
                this.scroller.setInertia(wheelInertia, true)
                wheelMS = Date.now()
                wheelInertia = 0
            }

            
            this.tween.stop()
        }
        
        this.scrollbarWrapper = this.add.component(_c => {
            _c.styling = 'top left'
            _c.animate = false
            _c.compact = true
            _c.classAdd('sk_ui_iceRink_scrollbarWrapper')

            this.scrollbarNative = _c.add.component(_c => {
                _c.styling = 'top left'
                _c.classAdd('sk_ui_iceRink_native_scrollbar')
                _c.animate = false
                _c.fakeContent = _c.add.component(_c => {
                    _c.classAdd('sk_ui_iceRink_native_scrollbar_fakeContent')
                    _c.animate = false
                })

                _c.element.addEventListener('scroll', _e => {
                    if (!_c.dragging) return
                    var scrollPos = _c.fakeContent.rect.top - _c.rect.top
                    this.scroller.value = scrollPos
                })

                
                _c.element.addEventListener('mousedown', _e => {
                    _c.dragging = true
                    this.scroller.stop()
                })

                _c.element.addEventListener('mouseup', _e => {
                    _c.dragging = false
                    this.scroller.start()
                })

                
                _c.element.addEventListener('wheel', onWheel)
            })

            _c.updatePosition = contentWrapperRect => {
                if (this.scrollbar.decoupled && this.onWrapperResized) return this.onWrapperResized(contentWrapperRect)
        
                var top = contentWrapperRect.top - this.parent.rect.top + this.scrollbar.offset.top
                _c.style.top = top + 'px'

                if (this.scrollbar.decoupled){
                    _c.style.right = (this.scrollbar.decoupled === 'outside' ? '-10px' : '0px')
                } else {
                    _c.style.left = (this.content.storedWidth - _c.rect.width + this.scrollbar.offset.right) + 'px'
                }

                _c.style.height = (contentWrapperRect.height - this.scrollbar.offset.bottom - this.scrollbar.offset.top) + 'px'
            }
        })

        this.contentWrapper = this.add.component(_c => {
            _c.classAdd('sk_ui_iceRink_contentWrapper')
            _c.styling = 'top center fullwidth fullheight'
            _c.moveBefore(this.scrollbarWrapper)


            this.content = _c.add.component(_c => {
                _c.styling = 'top center'
                _c.animate = false
                _c.classAdd('sk_ui_iceRink_content')

                
                this.add = _c.add

                

                var observer = new ResizeObserver(()=>{
                    var cRect = _c.rect


                    this.scrollbarNative.fakeContent.style.minHeight = cRect.height + 'px'
                    this.content.storedWidth = cRect.width
                    this.content.storedHeight = cRect.height

                    this.scroller.contentHeight = cRect.height
                    
                    this.scrollbar.updateDimensions()

                    
                    this.scrollbarWrapper.updatePosition(this.contentWrapper.rect)
                }).observe(_c.element)





                this.setContentPos = val => {
                    this.preRubberbandPos = val
                    _c.posY = val
                    _c.style.transform = `translate(0px, ${val}px)`
                    this.scrollbarNative.element.scrollTop = 0-val
                }
            })
            

            

            _c.element.addEventListener('wheel', onWheel)




            
            let pos = { top: 0, left: 0, x: 0, y: 0 };

            
            var direction = ''
            var movPos = {x: 0, y: 0}
            var currPos = undefined
            var velocity = 0
          
            var resetVelocityTimer = undefined

            var lastMS = Date.now()
            var calcVelocity = ()=>{
                const dx = currPos.x - movPos.x
                velocity = currPos.y - movPos.y

                clearTimeout(resetVelocityTimer)
                var delay = (velocity > 0 ? velocity : 0-velocity)
                //delay = Math.round(delay/4)
                delay = Math.round(25)
                
                resetVelocityTimer = setTimeout(()=>{
                    velocity = 0
                }, delay)
            }


            const mouseMoveHandler = _e => {
                this.content.style.pointerEvents = 'none'

                var x = (_e.clientX || _e.touches[0].clientX)
                var y = (_e.clientY || _e.touches[0].clientY)
                const dx = x - pos.x
                const dy = y - pos.y

                if (dy >= 0) direction = 'down'
                else direction = 'up'

                movPos = {x: x, y: y}
                if (!currPos) currPos = {x: x, y: y}

                var msDiff = Date.now() - lastMS
                if (msDiff > 300){
                    lastMS = Date.now()
                    currPos = {x: x, y: y}
                    
                }

                calcVelocity()
                
                this.scroller.value = this.content.last_posY + dy
            }

            const mouseUpHandler = _e => {
                this.content.style.pointerEvents = ''

                _c.element.removeEventListener('mousemove', mouseMoveHandler)
                document.removeEventListener('mousemove', mouseMoveHandler)

                _c.element.removeEventListener('mouseup', mouseUpHandler)
                document.removeEventListener('mouseup', mouseUpHandler)


                _c.element.removeEventListener('touchmove', mouseMoveHandler)
                document.removeEventListener('touchmove', mouseMoveHandler)

                _c.element.removeEventListener('touchend', mouseUpHandler)
                document.removeEventListener('touchend', mouseUpHandler)
            
                _c.element.style.cursor = ''
                _c.element.style.removeProperty('user-select')


                if (velocity !== 0) this.scroller.inertia = velocity
                
                this.scroller.value = this.preRubberbandPos
                this.scroller.start()
            }



            const mouseDownHandler = _e => {
                this.scroller.dictator = 'mouse_or_finger'

                pos = {
                    left: this.scrollbarNative.element.scrollLeft,
                    top: this.scrollbarNative.element.scrollTop,
                    x: (_e.clientX || _e.touches[0].clientX),
                    y: (_e.clientY || _e.touches[0].clientY),
                }

                _c.element.addEventListener('mousemove', mouseMoveHandler)
                document.addEventListener('mousemove', mouseMoveHandler)

                _c.element.addEventListener('mouseup', mouseUpHandler)
                document.addEventListener('mouseup', mouseUpHandler)


                _c.element.addEventListener('touchmove', mouseMoveHandler)

                _c.element.addEventListener('touchend', mouseUpHandler)
                document.addEventListener('touchend', mouseUpHandler)


                this.scroller.stop()
            
                this.content.last_posY = this.scroller.__value


                if (!this.canScroll) return
                _c.element.style.cursor = 'grabbing'
                _c.element.style.userSelect = 'none'
            }

            _c.element.addEventListener('mousedown', mouseDownHandler)
            _c.element.addEventListener('touchstart', mouseDownHandler)
        })

        var observer = new ResizeObserver(()=>{
            var cRect = this.content.rect
            this.storedHeight = this.rect.height
            this.scroller.containerHeight = this.rect.height

            this.scrollbarNative.fakeContent.style.minHeight = cRect.height + 'px'
            
            this.scrollbarWrapper.updatePosition(this.contentWrapper.rect)

        }).observe(this.element)


        this.scrollbar = this.scrollbarWrapper.add.fromNew(sk_ui_iceRink_scrollbar, _c => {
            _c.wrapper = this.contentWrapper
            _c.content = this.content
            _c.onWheel = _e => {
                //this.scrollbarNative.element.scrollTop += _e.deltaY
            }

            _c.onShow = ()=>{
                this.scrollbarWrapper.style.width = (sk.isOnMobile ? '4px' : 'var(--sk_ui_scrollbar_width)')
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
                    this.scrollbarWrapper.style.left = ''
                    this.scrollbarWrapper.style.right = (decoupled === 'outside' ? '-10px' : '0px')
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
            //this.scrollbar.updateDimensions(diff)

        }




        /*******/



        this.tween = new SK_Tween({
            speed: 10,
            onChanged: res => {
                this.scroller.value = res.current
            }
        })


        var lastOverscrollVal = 0
        this.preRubberbandPos = 0
        this.scroller = new sk_scroller({parent: this,
            onStep: ()=>{
                this.tween.step()
            },

            onStop: ()=>{
                this.tween.stop()
            },

            onChanged: res => {
                this.setContentPos(res)
                updateHandleTopPos(0-res)
                
                if (this.onOverscroll){
                    var diff = this.content.storedHeight - this.storedHeight

                    var overscrolls = {
                        top: 0-res,
                        bottom: 0-(diff - res)
                    }

                    var overscroll = 0
                    if (overscrolls.top > 0) overscroll = overscrolls.top
                    //if (overscrolls.top < 0 && overscrolls.bottom < 0) overscroll = overscrolls.bottom
                    if (overscroll !== lastOverscrollVal) this.onOverscroll(overscroll)
                    lastOverscrollVal = overscroll
                }
            }
        })

        this.attributes.add({friendlyName: 'Hide Overflow', name: 'hideOverflow', type: 'bool', onSet: val => {
            this.contentWrapper.style.overflow = (val ? 'hidden' : '')
        }})



        
    }

    scrollToChild(component){
        this.lastYPos = this.scroller.value
        this.tween.current = this.lastYPos
        var cRect = component.rect
        var newY = 0-((0-this.lastYPos) + cRect.top)
        this.tween.to(newY)
    }
}

class sk_ui_iceRink_scrollbar extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'top left'
        this.animate = false

        this.width = 0
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
            if (tRect.height < cRect.height) return tRect.height / cRect.height
            else return 1
        }

        this.attributes.add({friendlyName: 'Decoupled', name: 'decoupled', type: 'bool', onSet: val => {
            if (this.onDecoupled) this.onDecoupled(val)
        }})
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
        var heightRatio = this.getSizeDiff(this.wrapper, this.content)

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

        if (handleSize === 100) this.onHide()
        else this.onShow()  
    }
}

class sk_scroller {
    constructor(opt){
        this.opt = opt

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
        
        return (1.0 - (1.0 / ((opt.distanceFromEdge * this.springConstant / opt.containerHeight) + 1.0))) * opt.containerHeight;
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
        
        var direction = 'up'
        if (val < 0) direction = 'down'

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



    step(){
        this.__inertia -= this.__friction
        if (this.__inertia < 0){
            this.__inertia = 0
        }

        var diff = this.contentHeight - this.containerHeight

        if (diff > 0){
            var factoredInertia = this.__inertia*0.2
            if (this.__direction === 'down') this.__value += factoredInertia
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

        
        

        var diff = this.contentHeight - this.containerHeight
        
        var distanceFromBottom = 0 - (diff + val)
        if (val < 0 && distanceFromBottom < 0){
            this.isRubberbanding = false
            return 0
        } else {
            this.isRubberbanding = true
            this.__inertia -= 100
        }

        

        if (val > 0){
            this.isRubberbanding = true
            this.rubberbandingDirection = 'down'

            if (this.dictator === 'mouse_or_finger') this.rubberBandDistance = this.calcRubberband({distanceFromEdge: val, containerHeight: this.containerHeight})
            else this.rubberBandDistance = 0
            
            val = this.rubberBandDistance
        }



        if (distanceFromBottom > 0){
            this.isRubberbanding = true
            this.rubberbandingDirection = 'up'

            if (this.dictator === 'mouse_or_finger')this.rubberBandDistance = this.calcRubberband({distanceFromEdge: distanceFromBottom, containerHeight: this.containerHeight})
            else this.rubberBandDistance = 0

            val = (0-diff) + (0-this.rubberBandDistance)
        }

        
        
        this.__value = Math.round(val)
    }
}