class sk_ui_linkButton extends sk_ui_button {
    constructor(opt){
        super({...opt, ...{htmlTag: 'a', }})

        this.styling = 'left middle'
        
        this._icon.iconElement.classList.add('transition')

        this.icon = 'linkify'

        this.attributes.add({friendlyName: 'URL', name: 'url',  type: 'text', onSet: val => {
            this.element.setAttribute('href', val)
        }})

        this.attributes.add({friendlyName: 'Target', name: 'target',  type: 'text', onSet: val => {
            this.element.setAttribute('target', val)
        }})
    }
}