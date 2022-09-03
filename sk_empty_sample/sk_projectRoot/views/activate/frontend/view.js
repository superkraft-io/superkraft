class SK_App_View extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)

        this.form = this.add.component(_c => {
            _c.styling += ' fullwidth'
            _c.style.maxWidth = '512px'
            _c.padding = 32

            _c.add.label(_c => {
                _c.styling = 'fullwidth left'
                _c.text = 'Account Activation for ' + sk.userData.email
                _c.weight = 600
                _c.size = 18
            })

            _c.add.separator(_c => {
                _c.style.marginTop = '-12px'
            })

            _c.add.label(_c => {
                _c.styling = 'fullwidth left'
                _c.text = 'You account has not been activated yet.\nPlease enter your activation code below.'
            })

            _c.add.component(_c => {
                _c.styling += ' fullwidth'

                _c.marginTop = 10
                
                _c.add.label(_c => {
                    _c.styling = 'fullwidth left'
                    _c.text = 'Activation code'
                    _c.weight = 600
                    _c.style.marginBottom = '4px'
                })

                this.activationCode = _c.add.input(_c => {
                    _c.styling += ' fullwidth'
                    _c.placeholder = 'XXXXXXXXXXXXXXXXXXXX'
                    _c.style.fontSize = '20px'
                    _c.input.style.padding = '16px'
                    _c.input.style.textAlign = 'center'
                    _c.height = 52
                })

                _c.add.component(_c => {
                    _c.styling = 'fullwidth'

                    _c.vertical = false

                    _c.add.spacer()

                    _c.add.simpleActionBtn(_c => {
                        //_c.classAdd('sk_ui_gradient_default')
                        _c.text = 'Activate'

                        _c.onBeforeAction = ()=>{
    
                            if ((this.activationCode.value || '').trim().length === 0){
                                _c.hint({text: 'Invalid activation code', instaShow: true})
                                this.activationCode.transition('shake')
                                return
                            }
    
                            _c.action('activateAccount', {activationCode: this.activationCode.value})
                            .then(async res => {
                                await this.form.transition('fade out')

                                sk.app.add.successMessage(_c => {
                                    _c.closers = ['close']
                                    
                                    _c.message.text = 'Your account has been successfully activated.\nWe will redirect you to the dashboard once we are done preparing it for you.'
                                
                                    _c.onHidden = ()=>{ window.location = '/dashboard' }
                                })
                                .show()
                            })
                            .catch(err => {
                                _c.hint({text: 'Invalid activation code', instaShow: true})
                                this.activationCode.transition('shake')
                                console.error(err)
                            })
                        }
                    })
                })


                _c.add.separator()
    
                _c.add.component(_c => {
                    _c.styling += ' fullwidth'

                    _c.add.label(_c => {
                        _c.styling = 'fullwidth left'
                        _c.weight = 700
                        _c.text = `Didn't receive code?`
                    })

                    _c.add.component(_c => {
                        _c.styling += ' fullwidth'

                        _c.vertical = false
                        
                        _c.add.simpleActionBtn(_c => {
                            _c.text = 'Resend code'

                            
                            _c.onBeforeAction = ()=>{
                               
        
                                _c.action('resendActivationCode')
                                .then(res => {
                                    sk.app.add.successMessage(_c => {
                                        _c.message.text = 'We have sent a new activation code to your email'
                                    })
                                    .show()
                                })
                                .catch(err => {
                                    console.error(err)
                                })
                            }
                        })
                    

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
            })
        })
    }
}