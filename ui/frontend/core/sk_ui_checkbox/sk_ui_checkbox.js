class sk_ui_checkbox extends sk_ui_button {
    constructor(opt){
        super(opt)

        this.styling = 'left middle fullwidth'

        this.label.wrap = true
        
        this._icon.iconElement.classList.add('transition')

        this.icon = ''

        this.onClick = ()=>{
            if (this.checked && this.keepChecked) return
            this.checked = !this.checked
        }

        this._icon.fadeOnChange = true


        this.shapes_icons = {
            rectangle: 'check',
            circle: 'circle'
        }

        this.attributes.add({friendlyName: 'Checked State', name: 'checked_state', type: 'bool', onSet: val => {
            /*if (val) this._icon.iconElement.classList.add('sk_ui_checkbox_on')
            else this._icon.iconElement.classList.remove('sk_ui_checkbox_on')
            */

            this.__checked = val

            var newIcon = this.shapes_icons[this.shape]
            if (val) this.icon = newIcon
            else this.icon = 'none'
        }})

        this.attributes.add({friendlyName: 'Checked', name: 'checked', type: 'bool', onSet: val => {
            this.checked_state = val
            if (val){ if (this.onChecked) this.onChecked(this) }
            else { if (this.onUnchecked) this.onUnchecked(this) }
            
            if (this.onChanged) this.onChanged(val)
        }})


        this.attributes.add({friendlyName: 'Shape', name: 'shape', type: 'bool', onSet: val => {
            this.classAdd('sk_ui_checkbox_shape_' + val)

        }})
        this.__shape = 'rectangle'

        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'text', onSet: val => {
            this.classAdd('sk_ui_checkbox_shape_' + val)
        }})
    }
}