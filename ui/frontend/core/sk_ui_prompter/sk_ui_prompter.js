class sk_ui_prompter extends sk_ui_modal {
    constructor(parent){
        super(parent)

        this.header = this.content.add.label(_c => _c.size = 18 )

        this.message = this.content.add.label()

        this.promptContent = this.content.add.component(_c => {
            //_c.styling += ' fullwidth'
        })

        this.actionBtn = this.content.add.simpleActionBtn(_c => {
            _c.text = 'OK'
            _c.styling += 'fullwidth'
        })
    }
}
