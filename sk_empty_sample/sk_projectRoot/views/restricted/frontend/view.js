class SK_App_View extends sk_ui_component {
    constructor(parent){
        super(parent)

        var elapsedTime = (Date.now() - (new Date(sk.userData.date)).getTime()) / 1000 / 60 / 60 / 24
        var timeLeft = Math.floor(parseInt(sk.userData.duration) - elapsedTime)
        var timeText = ''
        if (timeLeft <= 1){
            timeText = 'Expires today'
        } else {
            timeText = 'Your restrictions will be lifted in ' + timeLeft + ' '
            if (timeLeft > 1) timeText += 'days'
            else timeText += 'day'
        }

        this.form = this.add.component(_c => {
            _c.styling += ' fullwidth'
            _c.style.maxWidth = '512px'
            _c.padding = 32

            _c.add.component(_c =>{
                _c.vertical = false

                _c.add.icon(_c => {
                    _c.icon = 'lock'
                    _c.size = 24
                    _c.marginRight = 16
                })

                _c.add.label(_c => {
                    _c.styling = 'fullwidth'
                    _c.text = 'Your account has been restricted'
                    _c.weight = 600
                    _c.size = 24
                })
            })


            _c.add.group(_c => {
                _c.styling += ' fullwidth'
                _c.padding = 8
                _c.header = 'Reason(s)'
                _c._header.setup(_c => {
                    _c.opacity = 0.75
                    _c.size = 12
                })

                _c.container.add.label(_c => {
                    _c.styling = 'fullwidth fullheight'
                    _c.wrap = true
                    _c.text = sk.userData.message
                })
            })

            _c.add.component(_c =>{
                _c.vertical = false
                _c.marginTop = 18
                _c.marginBottom = 18

                _c.add.icon(_c => {
                    _c.icon = 'clock'
                    _c.size = 24
                    _c.marginRight = 16
                    _c.color = '#ffca00'
                })

                _c.add.label(_c => {
                    _c.styling = 'fullwidth'
                    _c.text = timeText
                    _c.weight = 600
                    _c.color = '#ffca00'
                })
            })

            _c.add.label(_c => {
                _c.text = 'You can dispute the restrictions by sending us an email at contact@mysite.com'
                _c.size = 12
            })

            _c.add.component(_c =>{
                _c.styling = 'fullwidth'
                _c.vertical = false

                _c.add.spacer()

                _c.add.simpleActionBtn(_c => {
                    _c.text = 'Log out'
                    _c.onClick = ()=>{
                        _c.addStatusIndicator('ok')
                        setTimeout(()=>{
                            Cookies.remove('auth_token')
                            window.location = '/login'
                        }, 500)
                    }
                })
            })
        })


    }
}