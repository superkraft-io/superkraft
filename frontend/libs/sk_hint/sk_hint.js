class SK_Hint {
    constructor(opt){
        this.opt = opt

        this.position = ''

        this.hookMouseEvents()
    }

    set content(val){
        this.__content = val
    }

    set position(val = 'bottom center'){
        if (val === '') val = 'bottom center'
        this.__position = val
    }

    set instaShow(val){
        this.__instashow = val
        if (val) this.show()
    }

    setup(cb){
        this.__hint.setup(_c => { cb(_c) })
    }

    config(opt){
        if (opt.text) this.content = opt.text
        if (opt.position) this.position = opt.position
        if (opt.instaShow) this.instaShow = opt.instaShow
    }
    
    get created(){ return this.__hint }

    hookMouseEvents(){
        this.opt.parent.element.addEventListener('mouseenter', ()=>{
            this.show()
        })

        this.opt.parent.element.addEventListener('mouseleave', ()=>{
            this.onHide()
        })
    }

    async onHide(){
        if (!this.__content || !this.created) return
        clearTimeout(this.hintTimer)
        await this.__hint.hide()
        this.__hint.remove()
        this.__hint = undefined
    }

    show(){
        if (!this.__content || this.created) return
        this.__hint = new sk_ui_hint({parent: sk.app, noHint: true, target: this.opt.parent})
        this.__hint.setup(_c => {
            _c.content = this.__content
            _c.position = this.__position
            //_c.updatePosition()

            _c.onHide = ()=>{ this.onHide() }
        })

        this.hintTimer = setTimeout(()=>{
            this.__hint.show()
        }, 100)
    }

    hide(){
        this.onHide()
    }
}