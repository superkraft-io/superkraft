class sk_ui_checkbox extends sk_ui_button {
    constructor(opt){
        super(opt)

        this.styling = 'left middle fullwidth'
        
        this._icon.iconElement.classList.add('transition')

        this.icon = 'check'

        this._checked = false
        this.onClick = ()=>{
            this.checked = !this.checked
        }


        this.attributes.add({friendlyName: 'Checked', name: 'checked', type: 'bool', onSet: val => {
            if (val){
                this._icon.iconElement.classList.add('sk_ui_checkbox_on')
                if (this.onChecked) this.onChecked(this)
            } else {
                this._icon.iconElement.classList.remove('sk_ui_checkbox_on')
                if (this.onUnchecked) this.onUnchecked(this)
            }
        }})
        
    }
}