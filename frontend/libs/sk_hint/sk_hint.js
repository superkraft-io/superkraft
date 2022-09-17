class SK_Hint {
    constructor(opt){
        this.opt = opt

        this.position   = ''
        this.autoHide   = true
        this.limitWidth = true

        this.hookMouseEvents()
    }

    set text(val){
        this.__text = val
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
        this.text = opt.text
        if (opt.position)   this.position   = opt.position
        if (opt.instaShow)  this.instaShow  = opt.instaShow
        if (opt.autoHide   !== undefined) this.autoHide   = opt.autoHide
        if (opt.limitWidth !== undefined) this.limitWidth = opt.limitWidth
    }
    
    get created(){ return this.__hint }

    hookMouseEvents(){
        this.opt.parent.element.addEventListener('mouseenter', ()=>{
            if (this.__text) this.show()
        })

        this.opt.parent.element.addEventListener('mouseleave', _e => {
            var doHide = false
            for (var i in _e.path){
                var suo = _e.path[i].sk_ui_obj
                if (suo && suo._hint.__hint && suo.uuid === this.opt.parent.uuid){
                    doHide = true
                    break
                }
            }

            if (doHide) this.onHide()
        })
    }

    async onHide(){
        if (!this.created) return
        clearTimeout(this.hintTimer)
        await this.__hint.hide()
        try { this.__hint.remove() } catch(err) {}
        this.__hint = undefined
    }

    show(){
        if (!this.__text) return

        
        if (this.__hint){
            this.__hint.content = this.__text
            this.__hint.updatePos()
            return
        }

        this.__hint = new sk_ui_hint({parent: sk.app, noHint: true, target: this.opt.parent})
        this.__hint.setup(_c => {
            _c.content = this.__text
            _c.position = this.__position
            if (!this.limitWidth) _c.style.maxWidth = '100%'
            this.currentHintUUID = _c.uuid
            _c.onHide = uuid =>{ if (uuid === this.currentHintUUID) this.onHide() }
        })

        this.hintTimer = setTimeout(()=>{
            this.__hint.show(this.autoHide)
        }, 100)
    }

    hide(){
        this.onHide()
    }
}