class sk_ui_prompter extends sk_ui_modal {
    constructor(opt){
        super(opt)

        this.header = this.content.add.label(_c => {
            _c.marginRight = 128
            _c.size = 18
        })

        this.message = this.content.add.text(_c => {
            _c.wrap = true
            _c.width = 256
        })

        this.promptContent = this.content.add.component(_c => {
            //_c.styling += ' fullwidth'
        })

        this.actionBtn = this.content.add.simpleActionBtn(_c => {
            _c.text = 'OK'
            _c.styling += 'fullwidth'
        })
    }
}
