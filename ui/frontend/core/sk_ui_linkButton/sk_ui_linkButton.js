class sk_ui_linkButton extends sk_ui_button {
    sk_constructor(opt){
        super.sk_constructor(opt)

        this.styling = 'left middle fullwidth'
        
        this._icon.iconElement.classList.add('transition')

        this.icon = 'linkify'
    }
}