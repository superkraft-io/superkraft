class sk_ui_checkbox extends sk_ui_button {
    constructor(opt){
        super(opt)

        this.styling = 'left middle fullwidth'
        
        this._icon.iconElement.classList.add('transition')

        this.icon = 'check'

        this.onClick = ()=>{
            this.checked = !this.checked
        }



        this.attributes.add({friendlyName: 'Checked State', name: 'checked_state', type: 'bool', onSet: val => {
            if (val) this._icon.iconElement.classList.add('sk_ui_checkbox_on')
            else this._icon.iconElement.classList.remove('sk_ui_checkbox_on')
            this.__checked = val
        }})

        this.attributes.add({friendlyName: 'Checked', name: 'checked', type: 'bool', onSet: val => {
            this.checked_state = val
            if (val){ if (this.onChecked) this.onChecked(this) }
            else { if (this.onUnchecked) this.onUnchecked(this) }
            
            if (this.onChanged) this.onChanged(val)
        }})
        
    }
}