class sk_ui_iceRink extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.vertical = false
        this.compact = true


        
        
        this.scrollbarWrapper = this.add.component(_c => {
            _c.styling = 'top left'
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
                    var scrollPos = 0-(_c.fakeContent.rect.top - _c.rect.top)
                    //this.tween.to(scrollPos)
                })

                
                _c.element.addEventListener('mousedown', _e => {
                    //this.tween.speed = 1000
                })
            })
        })

        this.ums.on('sk_mobile', res => {
            if (res.data.orientation === 'portrait') this.scrollbar.hide(true)
            else this.scrollbar.show()
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
                    this.content.storedHeight = cRect.height

                    this.scroller.contentHeight = cRect.height

                    this.scrollbar.updateDimensions()
                }).observe(_c.element)





                this.setContentPos = val => {
                    this.preRubberbandPos = val
                    _c.posY = val
                    _c.style.transform = `translate(0px, ${val}px)`
                }
            })

            _c.element.addEventListener('wheel', _e => {
                this.scroller.inertia = _e.deltaY*0.25
            })





            
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
                delay = Math.round(delay/4)
                
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

                if (!this.canScroll) return
                _c.element.style.cursor = 'grabbing'
                _c.element.style.userSelect = 'none'


                this.scroller.stop()
                this.content.last_posY = this.scroller.__value
                this.ignoreRubberbanding = false
            }

            _c.element.addEventListener('mousedown', mouseDownHandler)
            _c.element.addEventListener('touchstart', mouseDownHandler)
        })

        var observer = new ResizeObserver(()=>{
            var cRect = this.content.rect
            this.storedHeight = this.rect.height
            this.scroller.containerHeight =  this.rect.height

            this.scrollbarNative.fakeContent.style.minHeight = cRect.height + 'px'
            //updateHandleTopPos(this.tween.current)
        }).observe(this.element)


        this.scrollbar = this.scrollbarWrapper.add.fromNew(sk_ui_iceRink_scrollbar, _c => {
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
        }

        this.preRubberbandPos = 0
        this.scroller = new sk_scroller({parent: this,
            onChanged: res => {
                this.setContentPos(res)
            }
        })

        this.attributes.add({friendlyName: 'Hide Overflow', name: 'hideOverflow', type: 'bool', onSet: val => {
            this.contentWrapper.style.overflow = (val ? 'hidden' : '')
        }})
    }
}

class sk_ui_iceRink_scrollbar extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'top left'
        this.animate = false

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
}

class sk_scroller {
    constructor(opt){
        this.opt = opt

        this.__inertia = 0
        this.__friction = 1

        this.__value = 0

        this.__run = true

        var step = async _ts => {
            if (this.__run){
                //await sk.utils.sleep(100)
                this.step()
            }
            
            window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)
    }

    set value(val){
        this.__value = val
        this.step()
    }

    set inertia(val){
        var formattedVal = (val < 0 ? 0-val : val)
        
        
        var direction = 'up'
        if (val < 0) direction = 'down'

        if (this.__direction !== direction) this.__inertia = formattedVal
        else this.__inertia += formattedVal
        
        if (this.__inertia > 700) this.__inertia = 700

        this.__direction = direction
        

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
            
            this.tryApplyRubberbanding()
        } else {
            this.__value = 0
        }

        
        //console.log(this.__value)

        if (this.opt.onChanged) this.opt.onChanged(this.__value)

    }

    start(){
        this.__run = true
    }

    stop(){
        this.__run = false
        this.__inertia = 0
    }


    tryApplyRubberbanding(){
        var val = this.__value

        var calcRubberband = opt => {
            var someConstant = 0.95
            return (1.0 - (1.0 / ((opt.distanceFromEdge * someConstant / opt.containerHeight) + 1.0))) * opt.containerHeight;
        }

        var diff = this.contentHeight - this.containerHeight
        
        var distanceFromBottom = 0 - (diff + val)
        if (val < 0 && distanceFromBottom < 0){
            this.isRubberbanding = false
            return 0
        } else {
            this.isRubberbanding = true
        }

        

        if (val > 0){
            this.isRubberbanding = true
            this.rubberbandingDirection = 'down'
            this.rubberBandDistance = calcRubberband({distanceFromEdge: val, containerHeight: this.containerHeight})
            val = this.rubberBandDistance
            
            this.__inertia += -100
        }



        if (distanceFromBottom > 0){
            this.isRubberbanding = true
            this.rubberbandingDirection = 'up'

            this.rubberBandDistance = calcRubberband({distanceFromEdge: distanceFromBottom, containerHeight: this.containerHeight})
            val = (0-diff) + (0-this.rubberBandDistance)

            this.__inertia += -100
        }

        
        this.__value = val
    }
}