class sk_ui_hint extends sk_ui_component {
    constructor(opt){
        super(opt)
        
        
        this.classAdd('sk_ui_hint_hidden')
        this.animate = false

        this.frosted = 'clear'

        this.target = opt.target
        
        this.label = this.add.label(_c => {
            _c.text = '<3'
            _c.wrap = true
        })

        this.results = {}

        this.element.addEventListener('mouseenter', ()=>{
            this.onHide(this.uuid)
        })
    }

    monitorParentPosition(){
        this.parentPosMonitor = setInterval(()=>{
            var pRect = this.suoParent.rect
            if (this.lastPRect && (pRect.x !== this.lastPRect.x || pRect.y !== this.lastPRect.y)){
                if (!this.sticky){
                    clearInterval(this.parentPosMonitor)
                    this.onHide(this.uuid)
                } else {
                    console.log('sticky')
                    this.updatePos()
                }
                return
            }

            this.lastPRect = pRect
        }, 10)
    }

    set content(val){
        this.label.text = val
    }

    resetAutoHide(duration = 3000){
        setInterval(this.hintHider)
        this.hintHider = setInterval(async ()=>{
            this.onHide(this.uuid, true)


        }, duration)
    }

    show(autoHide){
        if (autoHide){
            var duration = (!Number.isNaN(autoHide) ? autoHide : undefined)
            if (autoHide === true) duration = 3000
            this.resetAutoHide(duration)
        }
        
        this.calcPos()

        

        this.classAdd('sk_ui_hint_topMost')
        this.classRemove('sk_ui_hint_hidden')
        this.transition('fade ' + this.results.animation + ' in')

        this.element.style.left = this.results.x + 'px'
        this.element.style.top = this.results.y + 'px'

        setTimeout(()=>{
            this.monitorParentPosition()
        }, (this.sticky ? 0 : 200))
    }

    hide(instant = false){
        if (!instant) return this.transition('fade ' + this.results.animation + ' out')
    }

    updatePos(){
        this.resetAutoHide()
        this.calcPos()
        this.element.style.left = this.results.x + 'px'
        this.element.style.top = this.results.y + 'px'
    }

    calcPos(){
        this.opacity = 0

        var margin = 6

        var parentInfo = {
            calc: ()=>{
                parentInfo.rect = this.target.rect
                parentInfo.pos = {
                    x: parentInfo.rect.left + window.scrollX,
                    y: parentInfo.rect.top + window.scrollY
                }
            }
        }
        parentInfo.calc()

        var hintInfo = {
            calc: ()=>{
                hintInfo.rect = this.rect
            }
        }
        hintInfo.calc()

        var orientation = 'horizontal'
        var calcPos = {

            left: (secondOperation)=>{
                this.results.x = parentInfo.pos.x - hintInfo.rect.width - margin
                if (secondOperation && calcPos.secondIsASide) this.results.x += hintInfo.rect.width + margin

                if (!secondOperation) this.results.animation = 'left'

                if (this.results.x < 0) calcPos.right()
            },

            right: (secondOperation)=>{
                this.results.x = parentInfo.pos.x + parentInfo.rect.width + margin
                if (secondOperation && calcPos.secondIsASide) this.results.x -= hintInfo.rect.width + margin

                if (!secondOperation) this.results.animation = 'right'

                if (this.results.x > document.body.clientWidth) calcPos.left()
            },

            top: (secondOperation)=>{
                orientation = 'vertical'
                
                this.results.y = parentInfo.pos.y - hintInfo.rect.height - margin
                if (secondOperation && calcPos.secondIsASide) this.results.y += hintInfo.rect.height + margin

                if (!secondOperation) this.results.animation = 'up'

                if (this.results.x < 0) calcPos.bottom()
            },

            bottom: (secondOperation)=>{
                orientation = 'vertical'
                
                this.results.y = parentInfo.pos.y + parentInfo.rect.height + margin
                if (secondOperation && calcPos.secondIsASide) this.results.y -= hintInfo.rect.height + margin

                if (!secondOperation) this.results.animation = 'down'

                if (this.results.y > document.body.clientHeight) calcPos.left()
            },

            center: ()=>{
                if (orientation === 'vertical'){
                    this.results.x = parentInfo.pos.x + (parentInfo.rect.width/2) - (hintInfo.rect.width/2)
                    return
                }

                this.results.y = parentInfo.pos.y + (parentInfo.rect.height/2) - (hintInfo.rect.height/2)
            }
        }

        var positions = this.position.split(' ')
        if (positions[0] === 'center') positions = [positions[1], positions[0]]
        calcPos.secondIsASide = positions[1] !== 'center'
        this.positionFuncs = {
            a: ()=>{ calcPos[positions[0]]() },
            b: secondOperation =>{ calcPos[positions[1]](secondOperation) }
        }

        this.positionFuncs.a()
        this.positionFuncs.b(true)

        if (this.results.x < 0) this.results.x = 0
        if (this.results.y < 0) this.results.y = 0

        var appRect = sk.app.rect
        if (this.results.x + hintInfo.rect.width > appRect.width) this.results.x = appRect.width - hintInfo.rect.width
        if (this.results.y + hintInfo.rect.height > appRect.height) this.results.y = appRect.height - hintInfo.rect.height
    }
}