class sk_ui_segmentField extends sk_ui_component {
    constructor(parent){
        super(parent)
        
        this.styling = 'ttb'

        this._header = this.add.label(_c => {
            _c.text = 'Field'
            _c.weight = 700
            _c.size = 12
        })
    }

    set header(val){ this._header.text = val }
}