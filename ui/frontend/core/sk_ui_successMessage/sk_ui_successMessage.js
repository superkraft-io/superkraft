class sk_ui_successMessage extends sk_ui_prompter {
    constructor(opt){
        super(opt)
        
       
        this.header.remove()
        this.message.remove()
        this.actionBtn.remove()

        this.promptContent.setup(_c => {
            //_c.styling = 'center middle ttb'
            _c.vertical = true
            _c.width = 256
        })

        this.checkmark = this.promptContent.add.checkmark(_c => {
            _c.size = 64
        })

        this.message = this.promptContent.add.text(_c => {
            _c.styling = 'center'
            _c.style.marginTop = '18px'
            _c.wrap = true
        })

        setTimeout(()=>{ this.checkmark.check() }, 500)

        this.autoclose = 5000
    }
}