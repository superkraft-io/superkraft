class sk_ui_hint extends sk_ui_component {
    constructor(opt){
        super(opt)
        
        this.classAdd('sk_ui_ignoreMouse')
        this.classRemove('transition')

        this.frosted = 'clear'

        this.target = opt.target
        
        this.label = this.add.label(_c => {
            _c.text = '<3'
        })

        this.results = {}
    }

    set content(val){
        this.label.text = val
    }

    
    show(autohide){
        if (!autohide){
            clearTimeout(this.hintHider)
            this.hintHider = setTimeout(async ()=>{
                await this.onHide()
            }, 3000)
        }
        
        this.calcPos()

        

        this.classAdd('sk_ui_hint_topMost')
        this.transition('fade ' + this.results.animation + ' in')

        this.element.style.left = this.results.x + 'px'
        this.element.style.top = this.results.y + 'px'
    }

    hide(){
        //if (this.style.display !== '') return
        return this.transition('fade ' + this.results.animation + ' out')
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
    }
}