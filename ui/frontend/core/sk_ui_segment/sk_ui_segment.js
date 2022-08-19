class sk_ui_segment extends sk_ui_component {
    constructor(opt){
        super(opt)
        this.classAdd('vertical')
    }

    set orientation(val){
        this.classRemove('horizontal vertical')
        this.classAdd(val)
    }
}