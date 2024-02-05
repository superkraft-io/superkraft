class SK_App_View extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.pointerEvents = 'none'
        this.style.backgroundColor = 'red'

        sk.app.titlebar.remove()

        sk.app.body.classRemove('sk_ui_appBody_dapp')
    }
}