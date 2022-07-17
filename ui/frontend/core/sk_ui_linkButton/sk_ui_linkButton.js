class sk_ui_linkButton extends sk_ui_button {
    constructor(parent){
        super(parent)

        this.styling = 'left middle fullwidth'
        
        this._icon.iconElement.classList.add('transition')

        this.icon = 'linkify'
    }
}