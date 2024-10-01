class sk_ui_checkbox extends sk_ui_button {
    constructor(opt){
        super(opt)

        this.styling = 'left middle fullwidth'

        this.label.wrap = true

        this.iconContainer = this.add.component(_c => {
            _c.classAdd('sk_ui_checkbox_iconContainer')
            var tmpEl = _c.add.component()
            _c.moveBefore(this.label)
            this._icon.moveBefore(tmpEl)
            tmpEl.remove()
        })

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

            if (this.shape === 'circle') {
                if (!val) this._icon.style.backgroundColor = ''//this._icon.opacity = 0.001
                else this._icon.style.backgroundColor = sk.utils.cssVar('color', this.label)//this._icon.opacity = 1
                return
            }

            var newIcon = this.shapes_icons[this.shape]
            if (val) {
                this.icon = newIcon
            } else {
                this.icon = 'none'
            }
        }})

        this.attributes.add({friendlyName: 'Checked', name: 'checked', type: 'bool', onSet: val => {
            this.checked_state = val
            if (val){ if (this.onChecked) this.onChecked(this) }
            else { if (this.onUnchecked) this.onUnchecked(this) }
            
            if (this.onChanged) this.onChanged(val)
        }})


        this.attributes.add({friendlyName: 'Shape', name: 'shape', type: 'bool', onSet: async val => {
            this.classAdd('sk_ui_checkbox_shape_' + val)
            if (val === 'circle') {
                this._icon.style.borderRadius = '100%'
                this.icon = 'none'
                this._icon.style.width = '100%'
                this._icon.style.height = '100%'
            }
        }})
        this.__shape = 'rectangle'

        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'text', onSet: val => {
            this.classAdd('sk_ui_checkbox_shape_' + val)

           
        }})

        this.attributes.add({friendlyName: 'Checkbox Size', name: 'checkboxSize', type: 'number', onSet: val => {

            this.label.size = val

            var newSize = val

            if (this.shape === 'circle') {
                newSize -= 2
            }

            this.iconContainer.marginRight = newSize
            this._icon.style.minWidth = newSize + 'px'
            this._icon.style.minHeight = newSize + 'px'
            this._icon.style.maxWidth = newSize + 'px'
            this._icon.style.maxHeight = newSize + 'px'
            this._icon.style.fontSize = newSize + 'px'
            this._icon.size = newSize
        }})
    }
}