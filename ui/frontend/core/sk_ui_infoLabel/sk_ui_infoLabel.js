class sk_ui_infoLabel extends sk_ui_component {
    constructor(opt){
        super(opt)
        this.vertical = false

        this._icon = this.add.icn(_c => {
            _c.icon = ''
            _c.size = 12
            _c.fadeOnChange = true
        })

        this._label = this.add.text(_c => {
            _c.text = ''
            _c.size = 12
            _c.fadeOnChange = true
        })

        this.attributes.add({friendlyName: 'Text', name: 'text', type: 'text', onSet: val => {
            this._label.text = val
            this.__l10n = undefined
        }})

        this.attributes.add({friendlyName: 'L10N', name: 'l10n', type: 'text', onSet: val => {
            this._label.l10n = val
            this.__text = this._label.text
        }})

        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'text', onSet: val => {
            this._icon.icon = val
        }})

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'text', onSet: val => {
            this._icon.size = val
            this._label.size = val
        }})

        this.attributes.add({friendlyName: 'Fade On Change', name: 'fadeOnChange', type: 'bool', onSet: val => {
            this._icon.fadeOnChange = val
            this._label.fadeOnChange = val
        }})
    }
}