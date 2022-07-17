class sk_ui_button extends sk_ui_component {
    constructor(parent){
        super(parent)
        this.multiComponent = true

        this.classAdd('sk_ui_button_enabled')

        this._icon = this.add.icon()
        this.label = this.add.label(_c => {
            _c.styling = 'center middle'
            _c.vertical = false
        })



        var handleOnClickEvent = async ()=>{
            if (sk.app_type === 'dapp'){
                if (this.goto || this.goto_) sk.comm.main('openURL', {url: this.goto || this.goto_})
            } else {
                if (this.goto) window.location.replace(this.goto)
                if (this.goto_) window.open(this.goto_, '_blank')
            }

            if (this.__toggle) this.toggled = !this.__toggled

            if (this.onClick) this.onClick(this)

            this.handleAction()
        }


        
        var touchDragged = false
        
        if (!sk.isOnMobile){
            this.element.onclick = ()=>{
                if (this.disabled) return
                handleOnClickEvent()
            }
        } else {
            this.element.ontouchmove = ()=>{
                if (this.disabled) return
                touchDragged = true
            }
            this.element.ontouchstart = ()=>{
                if (this.disabled) return
                touchDragged = false
            }
            this.element.ontouchend = ()=>{
                if (this.disabled) return
                if (!touchDragged) handleOnClickEvent()
            }
        }


        this.element.onmouseenter = ()=>{
            if (this.onMouseEnter) this.onMouseEnter(this)
        }

        this.element.onmouseleave = ()=>{
            if (this.onMouseLeave) this.onMouseLeave(this)
        }

        this.element.ondblclick = ()=>{
            if (this.onDoubleClick) this.onDoubleClick(this)
        }

        
        this.attributes.add({friendlyName: 'Disabled', name: 'disabled', type: 'bool', onSet: val => {
            this.classRemove('sk_ui_button_enabled')
            if (!val) this.classAdd('sk_ui_button_enabled')
        }})


        this.attributes.add({friendlyName: 'Text', name: 'text', type: 'text', onSet: val => {
            this.label.text = val
        }})

        this.attributes.add({friendlyName: 'L10N', name: 'l10n', type: 'text', onSet: val => {
            this.label.l10n = val
        }})
        
        this.attributes.add({friendlyName: 'Type', name: 'type', type: 'list',
            items: [
                {name: 'Icon', value: 'icon'},
                {name: 'Simple', value: 'simple'}
            ],

            onSet: val => {
                if (val.indexOf('icon') > -1){
                    this.label.remove()
                    this.label = undefined
                }
                
                if (val.indexOf('simple') > -1){
                    this._icon.remove()
                    this._icon = undefined
                }
                this.classAdd(val)
            }
        })

        this.attributes.add({friendlyName: 'Vertical', name: 'vertical', type: 'bool', onSet: val => {
            this.classRemove('sk_ui_button_vertical')
            if (val) this.classAdd('sk_ui_button_vertical')
        }})

        this.attributes.add({friendlyName: 'Toggle', name: 'toggle', type: 'bool'})

        this.attributes.add({friendlyName: 'Toggled', name: 'toggled', type: 'bool', onSet: val => {
            this.classRemove('sk_ui_button_toggled')
            if (val) this.classAdd('sk_ui_button_toggled')
            if (this.onToggled) this.onToggled(this.toggled)
        }})

        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'icon', onSet: val => {
            this._icon.icon = val
        }})

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', onSet: val => {
            try { this.label.size = val } catch(err) {}
            try { this._icon.size = val } catch(err) {}
        }})



        this.attributes.add({friendlyName: 'Go To', name: 'gotoURL', type: 'text', onSet: val => {
            this.goto = undefined
            this.goto_ = undefined

            if (this.samePageGoto) return this.goto = val
            this.goto_ = val
        }})

        this.attributes.add({friendlyName: 'Same Page', name: 'samePageGoto', type: 'bool', onSet: val => {
            this.goto = undefined
            this.goto_ = undefined

            if (val) return this.goto_ = this.gotoURL
            this.goto = this.gotoURL
        }})

        this.attributes.add({
            friendlyName: 'Style',
            name: 'buttonStyle',

            type: 'list',
            items: [
                {name: 'Thin', value: 'thin'},
                {name: 'Normal', value: 'normal', default: true},
                {name: 'Thick', value: 'thick'}
            ],
            
            onSet: val => {
                this.classRemove('sk_ui_button_style_' + this.buttonStyle)
                this.classAdd('sk_ui_button_style_' + val)
            }
        })



        this.vertical = false
    }
    
    action(actionName, data = {}){
        return new Promise((resolve, reject)=>{
            this._actionData = data
            this._actionRoute = actionName
            this.actionPromise = {resolve: resolve, reject: reject}
        })
    }

    post(data){
        return this.action('', {...data, ...{asPost: true}})
    }

    async handleAction(){
        if (this.awaitingAction) return
        if (this.onBeforeAction) this.onBeforeAction()
        if (!this._actionData) return

        this.awaitingAction = true



        if (this.loaderIndicator) await this.loaderIndicator.destroy()
        if (this.actionStatusIndicator) await  this.actionStatusIndicator.destroy()
        this.loaderCreateTimer = setTimeout(()=>{
            this.loaderIndicator = this.addStatusIndicator({status: 'loader', autohide: false})
        }, 250)





        if (this._actionData.asPost){
            sk_communicator.send(this._actionData).then(res => {
                this.handleActionResponse(res)
            })
        } else {
            sk.actions[this._actionRoute](this._actionData)
            .then(res => {
                this.handleActionResponse(res)
            })
            .catch(err => { 
                this.handleActionResponse(err)
            })
        }
    }

    async handleActionResponse(res){
        clearInterval(this.loaderCreateTimer)
        if (this.loaderIndicator){
            await this.loaderIndicator.destroy()
            this.loaderIndicator = undefined
        }

        this.awaitingAction = undefined
        if (res.rejected || res.status === false){
            this.actionStatusIndicator = this.addStatusIndicator({status: 'fail', autohide: true, onDestroy: ()=>{ this.actionStatusIndicator = undefined }})
            return this.actionPromise.reject(res)
        }

        this.actionStatusIndicator = this.addStatusIndicator({status: 'ok', autohide: true, onDestroy: ()=>{ this.actionStatusIndicator = undefined }})
        this.actionPromise.resolve(res)
    }


    addStatusIndicator(opt){
        var defOpt = {
            ...{
                status: '',
                autohide: true,
            },

            ...opt
        }

        var statuses = {
            loader  : 'circle notch loader',
            ok      : 'green check circle outline',
            fail    : 'times circle outline red',
            warning : 'exclamation triangle icon yellow',
            
        }

        return this.label.add.icon(_c => {
            if (defOpt.prepend) _c.moveBefore(this._icon)

            _c.icon = statuses[defOpt.status]
            _c.size = 0
            _c.iconElement.style.opacity = 0

            if (defOpt.status === 'loader'){
                var degree = 0
                var loaderTimer = setInterval(()=>{
                    degree += Math.floor(360/2)
                    _c.iconElement.style.transform = 'rotate(' + degree + 'deg)'
                    setTimeout(()=>{
                        _c.iconElement.style.opacity = 0.5
                        setTimeout(()=>{
                            _c.iconElement.style.opacity = 1
                        }, 250)
                    }, 250)
                }, 250)
            }

            if (defOpt.side === 'left') _c.moveBefore(this.label)

            setTimeout(()=>{
                _c.size = 14

                if (defOpt.side === 'left'){
                    _c.marginRight = 6
                    _c.marginLeft = -6
                } else {
                    _c.marginLeft = 6
                    _c.marginRight = -6
                }

                setTimeout(()=>{
                    _c.iconElement.style.opacity = 1
                }, 250)
            }, 100)
        
            _c.destroy = ()=>{
                return new Promise(resolve => {
                    _c.iconElement.style.opacity = 0

                    clearInterval(loaderTimer)

                    setTimeout(()=>{
                        _c.size = 0
                        _c.marginLeft = 0
                        _c.marginRight = 0
                        setTimeout(() => {
                            _c.remove()
                            if (defOpt.onDestroy) defOpt.onDestroy()
                            resolve()
                        }, 200)
                    }, 200)
                })
            }


            if (!defOpt.autohide) return

            setTimeout(()=>{
               _c.destroy() 
            }, 3000)
        })
    }
}