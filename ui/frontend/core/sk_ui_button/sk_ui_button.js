class sk_ui_button extends sk_ui_component {
    constructor(opt){
        super({...{htmlTag: 'button'}, ...opt})
        this.multiComponent = true


        this.tabIndex = 100

        this.classAdd('sk_ui_button_enabled sk_ui_button_enabled_interactable')

        this._icon = this.add.icon(_c => {
            _c.onChanged = ()=>{ if (this.onIconChanged) this.onIconChanged() }
        })
        
        this.label = this.add.label(_c => {
            _c.styling = 'center middle'
            _c.vertical = false
        })


        

        var handleOnClickEvent = async _e => {
            

            if (this.goto || this.goto_) sk.openURL(this.goto || this.goto_, this.goto_ !== undefined)
            

            if (this.__togglable) this.toggled = !this.__toggled

            if (this.onClick) this.onClick(_e, this)

            this.handleAction()

            if (_e.stopPropagation && !_e.defaultPrevented){
                if (!this.contextMenu.menu) sk.ums.broadcast('sk_ui_contextMenu-hide', undefined, {fromGlobal: true})
                _e.stopPropagation()
            }
        }


        
        var touchDragged = false

        this.doClick = _e => {
            if (this.disabled) return
            handleOnClickEvent(_e || {})
        }
        
        if (!sk.isOnMobile){
            this.element.addEventListener('click', _e => {
                this.doClick(_e)
            })

            
        } else {
            this.element.ontouchmove = _e => {
                if (this.disabled) return

                _e.stopPropagation()
                _e.preventDefault()
                
                
                var pos = sk.interactions.getPos(_e, true)
                var diff = {x: pos.x - this.__touchStartPos.x, y: pos.y - this.__touchStartPos.y}
                if (diff.x < 0) diff.x = 0 - diff.x
                if (diff.y < 0) diff.y = 0 - diff.y

                if (diff.x < 3 && diff.y < 3) return

                if (this.onTouchMove) this.onTouchMove(_e)
                    
                touchDragged = true
            }

            this.element.ontouchstart = _e => {
                if (this.disabled) return

                _e.stopPropagation()
                _e.preventDefault()
                
                this.__touchStartPos = sk.interactions.getPos(_e, true)
                if (this.onTouchStart) this.onTouchStart(_e)
                touchDragged = false

                _e.preventDefault()

                sk.ums.broadcast('sk_ui_contextMenu-hide', undefined, {fromGlobal: true, toBE: false})
            }

            this.element.ontouchend = _e => {
                if (this.disabled) return

                _e.stopPropagation()
                _e.preventDefault()
                
                if (!touchDragged){
                    if (this.onTouchEnd) this.onTouchEnd(_e)
                    handleOnClickEvent(_e)
                }
            }
        }

        this.element.onmouseenter = _e => {
            if (this.onMouseEnter) this.onMouseEnter(this, _e)
        }

        this.element.onmouseleave = _e => {
            if (this.onMouseLeave) this.onMouseLeave(this, _e)
        }

        this.element.ondblclick = _e => {
            if (this.onDoubleClick) this.onDoubleClick(this, _e)
        }

        
        this.attributes.add({friendlyName: 'Disabled', name: 'disabled', type: 'bool', onSet: val => {
            this.classRemove('sk_ui_button_enabled')
            if (!val) this.classAdd('sk_ui_button_enabled')
        }})

        this.attributes.add({friendlyName: 'Interactable', name: 'interactable', type: 'bool', onSet: val => {
            this.classRemove('sk_ui_button_enabled_interactable')
            if (val) this.classAdd('sk_ui_button_enabled_interactable')
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

        this.attributes.add({friendlyName: 'Togglable', name: 'togglable', type: 'bool'})

        this.attributes.add({friendlyName: 'Toggle State', name: 'toggleState', type: 'bool', onSet: val => {
            this.classRemove(this.toggleClass || 'sk_ui_button_toggled')
            if (val) this.classAdd(this.toggleClass || 'sk_ui_button_toggled')

            this.__toggled = val
        }})
        
        this.attributes.add({friendlyName: 'Toggled', name: 'toggled', type: 'bool', onSet: val => {
            this.toggleState = val
            if (this.onToggled) this.onToggled(this.toggled)
        }})

        this.attributes.add({friendlyName: 'Toggle Class', name: 'toggleClass', type: 'text', onSet: val => {
            
        }})

        


        this.attributes.add({friendlyName: 'Primary', name: 'primary', type: 'bool', onSet: val => {
            this.classRemove('sk_ui_button_primary')
            if (val) this.classAdd('sk_ui_button_primary')
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

        this.attributes.add({
            friendlyName: 'Appearance',
            name: 'appearance',

            type: 'list',
            items: [
                {name: 'Normal', value: 'normal', default: true},
                {name: 'Action', value: 'action'}
            ],
            
            onSet: val => {
                this.classRemove('sk_ui_button_appearance_' + this.appearance)
                this.classAdd('sk_ui_button_appearance_' + val)
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
        if (this.actionStatusIndicator) await this.actionStatusIndicator.destroy()
        this.loaderCreateTimer = setTimeout(()=>{
            this.loaderIndicator = this.addStatusIndicator({status: 'loader', autoHide: false})
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
            this.actionStatusIndicator = this.addStatusIndicator({status: 'fail', autoHide: true, onDestroy: ()=>{ this.actionStatusIndicator = undefined }})
            return this.actionPromise.reject(res)
        }

        this.actionStatusIndicator = this.addStatusIndicator({status: 'ok', autoHide: true, onDestroy: ()=>{ this.actionStatusIndicator = undefined }})
        this.actionPromise.resolve(res)
    }


    addStatusIndicator(opt){
        return this.add.statusIndicator(_c => {
            _c.status = opt.status
            _c.side = opt.side
            
            if (opt.autoHide !== false) _c.autoHide = true

            
            if (opt.size){
                if (_c.indicator) _c.indicator.animate = false
                _c.size = opt.size || 16
                if (_c.indicator) _c.indicator.animate = true
            }

            if (opt.marginLeft){
                _c.marginLeft = opt.marginLeft
            }

            if (opt.marginRight){
                _c.marginRight = opt.marginRight
            }

            if (opt.onHidden){
                _c.onHidden = ()=>{
                    opt.onHidden()
                }
            }
        })
    }
}