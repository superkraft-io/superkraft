class sk_ui_switch extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)
        
        this.multiComponent = true

        var size = 18

        this.styling = 'left middle'

        this.style.width = Math.round(size*1.75) + 'px'
        this.style.height = size + 'px'
        this.style.padding = '2px'
        this.style.borderRadius = size + 'px'
        this.style.backgroundColor = '#3c3c3c'
        this.style.cursor = 'pointer'

        this.spacer = this.add.spacer(_c => _c.styling = '' )

        this.handle = this.add.component(_c => {
            _c.style.borderRadius = size + 'px'
            _c.style.width = size-4 + 'px'
            _c.styling += ' fullheight'
            _c.style.backgroundColor = '#767676'
        })

        this.element.onclick = async ()=>{
            this.toggled = !this.toggled
            if (this.onChanged) this.onChanged(this.toggled)
        }

        this.sk_attributes.add({
            friendlyName: 'Toggled',
            name: 'toggled',
            type: 'bool',

            onSet: val => {
                this.spacer.styling = ''
                this.classRemove('sk_ui_switch_highlighted')

                if (val){
                    this.spacer.styling = 'fill'
                    this.classAdd('sk_ui_switch_highlighted')
                }
            }
        })

        this.sk_attributes.add({
            friendlyName: 'Flipped',
            name: 'flipped',
            type: 'bool',

            onSet: val => {
                this.classAdd('sk_ui_switch_flipped')
            }
        })
    }
}