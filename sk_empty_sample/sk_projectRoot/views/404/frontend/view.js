class SK_App_View extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.add.component(_c => {
            _c.styling = 'center middle ttb'

            _c.add.label(_c => {
                _c.styling = 'left'
                _c.text = '404'
                _c.size = 50
                _c.weight = 500
                
            })

            _c.add.label(_c => {
                _c.styling = 'left'
                _c.text = 'This page could not be found.'
                _c.marginTop = 24
            })

            _c.add.component(_c => {
                _c.marginTop = 10
                _c.add.label(_c => {
                    _c.styling = 'left'
                    _c.text = 'If you believe this  page should be found, please contact support:'
                })
    
                _c.add.button(_c => {
                    _c.text = 'contact@mysite.com'
                    _c.type = 'simple'
                    _c.gotoURL = 'contact@mysite.com'
                    _c.height = 32
                    _c.marginLeft = 9
                    _c.label.weight = 500
                })
                
            })
        })
    }
}