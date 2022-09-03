class sk_ui_fileDrop_Area extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)

        this.outline = this.add.component(_c => {
            _c.classAdd('sk_ui_fileDrop_Area_outline')
        })
    }
}