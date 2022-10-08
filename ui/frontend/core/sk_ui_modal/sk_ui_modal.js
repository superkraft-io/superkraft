class sk_ui_modal extends sk_ui_component {
    constructor(opt){
        super(opt)
        

        this.frosted = true

        

        this.dimmer = this.add.component(_c => {
            _c.classAdd('sk_ui_modal_dimmer')
            _c.element.onclick = _e => {
                if (!this.shown) return
                _e.preventDefault()
                this.hide()
            }
        })

        this.add.component(_c => {
            _c.styling = 'center middle'
            _c.classAdd('sk_ui_modal_contentWrapper')
            
            this.content = _c.add.component(_c => {
                _c.classAdd('sk_ui_modal_content face_color')

                this.closeBtn = _c.add.button(_c => {
                    _c.classAdd('sk_ui_modal_closeBtn')
                    _c.icon = 'close'
                    _c.type = 'clear icon'
                    _c.onClick = ()=>{
                        if (this.reject) this.reject()
                        this.hide()
                    }
                })
            })
        })
    }

    hide(){
        return new Promise(async resolve => {
            if (this.onHide) this.onHide()
            await this.content.transition('scale out')
            await this.transition('fade out')
            if (this.onHidden) this.onHidden()
            resolve()
            this.remove()
        })
    }

    show(){
        return new Promise(async resolve => {
            if (this.onShow) this.onShow()
            await this.transition('fade in')
            await this.content.transition('scale in')

            if (this.onShown) this.onShown()
            if (this.pB) this.pB.progress = 100

            if (this._autoClose) this.autoCloseTimer = setTimeout(()=>{
                if (this._autoClose !== false) this.hide()
            }, this._autoClose)

            this.shown = true
            
            resolve()
        })
    }

    prompt(data){
        this.data = data
        return new Promise((resolve, reject)=>{
            this.resolve = resolve
            this.reject = reject
            this.show()
        })
    }

    set closers(val){
        if (!val.includes('close')){
            this.closeBtn.remove()
            this.pB = undefined
        }

        if (!val.includes('dimmer')) this.dimmer.remove()
        if (val.includes('content')) this.content.element.addEventListener('click', ()=>{ this.hide() })
    }

    set autoclose(val){
        this._autoClose = val

        if (val === false) return

        this.closeBtn.add.progressBar(_c => {
            _c.classAdd('sk_ui_modal_closeProgressBar')
            this.pB = _c.as.circle(val)
            _c.size = 25
            this.pB.progress = 100
        })
    }
}
