class sk_ui_fileDrop_Area extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.outline = this.add.component(_c => {
            _c.classAdd('sk_ui_fileDrop_Area_outline')
        })
    }
}