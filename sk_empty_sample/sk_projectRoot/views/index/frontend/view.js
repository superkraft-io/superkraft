class SK_App_View extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.add.label(_c => {
            _c.text = 'Welcome to Superkraft'
        })

        this.add.label(_c => {
            _c.text = 'Lets start building a better world 🚀'
        })
    }
}