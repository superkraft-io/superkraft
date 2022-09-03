class sk_ui_segmentField extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)
        
        this.styling = 'ttb'

        this._header = this.add.label(_c => {
            _c.text = 'Field'
            _c.weight = 700
            _c.size = 12
        })
    }

    set header(val){ this._header.text = val }
}