class sk_ui_group extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'left top ttb'
        this.classAdd('sk_ui_group_opaque')

        this.top = this.add.component(_c => {
            _c.styling += ' fullwidth center middle'
            _c.classAdd('sk_ui_group_top')

            this._header = _c.add.label(_c => {
                _c.classAdd('sk_ui_group_header')
            })
        })
        

        this.container = this.add.component(_c => {
            _c.styling = 'left top ttb fullwidth'
            _c.classAdd('sk_ui_group_container')
        })

        this.attributes.add({friendlyName: 'Header', name: 'header', type: 'text', onSet: val => { this._header.text = val }})
        this.attributes.add({friendlyName: 'Clear', name: 'clear', type: 'bool', onSet: val => { this['class' + (val ? 'Remove' : 'Add')]('sk_ui_group_opaque') }})
    }
}