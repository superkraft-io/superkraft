class sk_ui_simpleActionBtn extends sk_ui_button {
    sk_constructor(opt){
        super.sk_constructor(opt)
        this.multiComponent = true
        
        this.type = 'simple'
        this.buttonStyle = 'action'
    }
}