class sk_ui_linkButton extends sk_ui_button {
    constructor(opt){
        super(opt)

        this.styling = 'left middle fullwidth'
        
        this._icon.iconElement.classList.add('transition')

        this.icon = 'linkify'
    }
}