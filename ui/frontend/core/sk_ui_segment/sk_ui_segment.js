class sk_ui_segment extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)
        this.classAdd('vertical')
    }

    set orientation(val){
        this.classRemove('horizontal vertical')
        this.classAdd(val)
    }
}