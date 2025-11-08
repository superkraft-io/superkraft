class sk_ui_segmentField extends sk_ui_component {
    constructor(opt){
        super(opt)
        
        this.styling = 'ttb'

        this._header = this.add.label(_c => {
            _c.text = 'Field'
            _c.weight = 400
            _c.marginBottom = 2
        })
    }

    set header(val){ this._header.text = val }
}