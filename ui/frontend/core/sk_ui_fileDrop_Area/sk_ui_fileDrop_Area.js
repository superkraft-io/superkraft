class sk_ui_fileDrop_Area extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.pointerEvents = 'none'

        this.outline = this.add.component(_c => {
            _c.classAdd('sk_ui_fileDrop_Area_outline')
            _c.pointerEvents = 'none'
        })
    }
}