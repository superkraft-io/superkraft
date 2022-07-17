class sk_ui_successMessage extends sk_ui_prompter {
    constructor(parent){
        super(parent)
        
       
        this.header.remove()
        this.message.remove()
        this.actionBtn.remove()

        this.promptContent.setup(_c => {
            //_c.styling = 'center middle ttb'
            _c.vertical = true
        })

        this.checkmark = this.promptContent.add.checkmark(_c => {
            _c.size = 75
        })
        this.message = this.promptContent.add.label(_c => {
            _c.styling = 'center'
            _c.style.marginTop = '18px'
            _c.wrap = true
        })

        setTimeout(()=>{ this.checkmark.check() }, 500)

       this.autoclose = 5000
    }
}