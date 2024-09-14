class sk_ui_dappTitlebar extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling += ' fullwidth'

        this.vertical = 'none'
        this.canMoveView = true
        
        this.attributes.add({friendlyName: 'OS', name: 'os', type: 'string', onSet: val =>{
            var os = 'win'
            if (val.indexOf('macos') > -1) os = 'mac'

            this.classAdd('sk_ui_dappTitlebar_' + os)

            
            this._actions = this.add.fromNew(sk_ui_dappTitlebar_actions, _c => _c.configureForOS(os))
            this._title   = this.add.fromNew(sk_ui_dappTitlebar_title)
        }})

        this.attributes.add({friendlyName: 'Closable', name: 'closable', type: 'bool', onSet: val =>{
            if (this._actions.close) this._actions.close.transition('fade ' + (val ? 'in' : 'out'))
        }})

        this.attributes.add({friendlyName: 'Maximizable', name: 'maximizable', type: 'bool', onSet: val =>{
            if (this._actions.maximize) this._actions.maximize.transition('fade ' + (val ? 'in' : 'out'))
        }})

        this.attributes.add({friendlyName: 'Minimizable', name: 'minimizable', type: 'bool', onSet: val =>{
            if (this._actions.minimize) this._actions.minimize.transition('fade ' + (val ? 'in' : 'out'))
        }})


        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'string', onSet: val =>{
            var split = val.split('.')
            var ext = split[split.length - 1]

            var validExts = ['png', 'jpg', 'jpeg', 'webp', 'gif']

            var isImg = validExts.includes(ext)

            if (isImg){
                this._title.icon = this._title.iconContainer.add.image(_c => {
                    _c.size = 16
                    _c.url = val
                })
            } else {
                this._title.icon = this._title.iconContainer.add.icon(_c => {
                    _c.size = 16
                    _c.icon = val
                })
            }
        }})

        this.attributes.add({friendlyName: 'Title', name: 'title', type: 'string', onSet: val =>{
            this._title.label.text = val
        }})
    }
}

class sk_ui_dappTitlebar_title extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling += ' fullheight'
        this.vertical = false
        this.canMoveView = true

        this.iconContainer = this.add.component(_c => {
            _c.marginRight = 8
        })
        
        this.label = this.add.label(_c => {
            _c.canMoveView = true
            //_c.weight = 600
        })
    }
}

class sk_ui_dappTitlebar_actions extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling += ' fullheight'
        this.vertical = false

        this.close    = this.add.fromNew(sk_ui_dappTitlebar_actions_button, _c => {
            _c.classAdd('sk_ui_dappTitlebar_actions_button_closeBtn');
            _c.icon = 'close'
            _c.onClick = ()=>{ sk.window.close(this.parent.terminateOnClose || false) }
        })

        this.maximize = this.add.fromNew(sk_ui_dappTitlebar_actions_button, _c => {
            _c.classAdd('sk_ui_dappTitlebar_actions_button_maximizeBtn')
            _c.onClick = ()=>{ sk.window.maximize() }
        })

        this.minimize = this.add.fromNew(sk_ui_dappTitlebar_actions_button, _c => {
            _c.classAdd('sk_ui_dappTitlebar_actions_button_minimizeBtn');
            _c.icon = 'window minimize outline'
            _c.onClick = ()=>{ sk.window.minimize() }
        })
    }

    configureForOS(os){
        this.classAdd('sk_ui_dappTitlebar_actions_' + os)

        this['configureFor_' + os]()
        
        this.close.configureForOS(os, 'close')
        this.maximize.configureForOS(os, 'maximize')
        this.minimize.configureForOS(os, 'minimize')

        if (!sk.window.closable    ) this.close.remove()
        if (!sk.window.maximizable ) this.maximize.remove()
        if (!sk.window.minimizable ) this.minimize.remove()
    }

    configureFor_win(){
        this.minimize.moveBefore(this.close)
        this.maximize.moveBefore(this.close)

        this.maximize.icon = 'square outline'
    }

    configureFor_mac(){
        this.minimize.moveBefore(this.maximize)
        this.maximize.icon = 'sort'
        this.minimize.icon = 'minus'
    }
}

class sk_ui_dappTitlebar_actions_button extends sk_ui_button {
    constructor(opt){
        super(opt)
        this.type = 'icon'
    }

    configureForOS(os, action){
        this.classAdd('sk_ui_dappTitlebar_actions_button_' + os)
        this.classAdd('sk_ui_dappTitlebar_actions_button_' + os + '_' + action)
        this['configureFor_' + os](os, action)

        if (os === 'win'){
            this._icon.size = 12
        }
    }

    configureFor_win(os, action){
   }

    configureFor_mac(os, action){
    }
}