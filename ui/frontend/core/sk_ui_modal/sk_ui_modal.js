class sk_ui_modal extends sk_ui_component {
    constructor(opt){
        super(opt)
        

        this.frosted = true
        this.compact = true
        

        this.dimmer = this.add.component(_c => {
            _c.classAdd('sk_ui_modal_dimmer')
            _c.element.onclick = _e => {
                if (!this.shown) return
                _e.preventDefault()
                this.hide()
            }
        })

        /*this.add.component(_c => {
            _c.styling = 'center middle ttb'
            _c.classAdd('sk_ui_modal_contentWrapper')
            _c.vertical = true
            _c.compact = true
            
            this.contentContainer = _c.add.component(_c => {
                _c.classAdd('sk_ui_modal_content face_color')
                _c.styling += ' fullheight'
                _c.vertical = true
                _c.compact = true

                _c.add.iceRink(_c => {
                    _c.styling += ' fullheight fullwidth'
                    _c.vertical = true
                    _c.content.styling += ' ttb'
                    _c.content.vertical = true
                    _c.hideHandle = true
                    this.content = _c.content
                    _c.content.margin = 16
                })

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
        })*/

        this.closeBtn = this.add.button(_c => {
            _c.classAdd('sk_ui_modal_closeBtn')
            _c.icon = 'close'
            _c.type = 'clear icon'
            _c._icon.color = 'white'
            _c.onClick = ()=>{
                if (this.reject) this.reject()
                this.hide()
            }
        })

        this.contentContainer = this.add.component(_c => {
            _c.styling = 'center middle ttb'
            _c.classAdd('sk_ui_modal_contentWrapper')
            _c.vertical = true
            _c.compact = true
            _c.animate = false

            this.icerink = _c.add.iceRink(_c => {
                _c.styling += ' middle fullheight'

                _c.vertical = true
                _c.axis = 'y'
                _c.scrollerY.scrollbar = true
                _c.autoHeight = true
                _c.compact = true
                _c.scrollbarY.offset.right = 16
                if (sk.isOnMobile) _c.scrollbarY.offset.bottom = 16

                //_c.contentWrapper.styling = ' middle'

                _c.content.setup(_c => {
                    _c.styling += ' ttb'
                    _c.vertical = true
                    if (sk.isOnMobile && !sk.mobile.homeButton) _c.paddingBottom = 32

                    _c.style.width = 'fit-content'

                    
                })

                this.wrapper = _c.contentWrapper
                this.content = _c.content

            })

            
        })


        this.escapeKeyCloser = _e => {
            if (_e.key !== 'Escape') return
            _e.stopPropagation()
            _e.preventDefault()
            this.hide()
        }

        document.addEventListener('keydown', this.escapeKeyCloser)
    }

    hide(){
        return new Promise(async resolve => {
            if (this.onHide) this.onHide()
            //this.contentContainer.transition('scale out')
            await this.transition('fade out')
            if (this.onHidden) this.onHidden()
            this.remove()
            document.removeEventListener('keydown', this.escapeKeyCloser)
            resolve()
        })
    }

    show(){
        return new Promise(async resolve => {
            if (this.onShow) this.onShow()
            //this.contentContainer.transition('scale in')
            await this.transition('fade in')
            

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
        if (val.includes('content')) this.contentContainer.element.addEventListener('click', ()=>{ this.hide() })

        if (!val.includes('escape')){
            document.removeEventListener('keydown', this.escapeKeyCloser)
        }
    }

    set autoclose(val){
        this._autoClose = val

        if (val === false) return

        this.closeBtn.add.progressBar(_c => {
            _c.classAdd('sk_ui_modal_closeProgressBar')
            this.pB = _c.as.circle({duration: val})
            _c.size = 25
            this.pB.progress = 100
        })
    }
}
