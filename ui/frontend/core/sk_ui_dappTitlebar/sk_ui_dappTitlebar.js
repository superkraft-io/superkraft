class sk_ui_dappTitlebar extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.styling += ' fullwidth'

        this.vertical = 'none'
        this.canMoveView = true
        
        this.attributes.add({friendlyName: 'OS', name: 'os', type: 'string', onSet: val =>{
            var os = 'win'
            if (val.indexOf('darwin') > -1) os = 'mac'

            this.classAdd('sk_ui_dappTitlebar_' + os)

            
            this._actions = this.add.fromNew(sk_ui_dappTitlebar_actions, _c => _c.configureForOS(os))
            this._title   = this.add.fromNew(sk_ui_dappTitlebar_title)
        }})

        this.attributes.add({friendlyName: 'Closable', name: 'closable', type: 'bool', onSet: val =>{
            
        }})

        this.attributes.add({friendlyName: 'Maximizable', name: 'maximizable', type: 'bool', onSet: val =>{
            
        }})

        this.attributes.add({friendlyName: 'Minimizable', name: 'minimizable', type: 'bool', onSet: val =>{
            
        }})


        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'string', onSet: val =>{
            this._title.icon.url = val
        }})

        this.attributes.add({friendlyName: 'Title', name: 'title', type: 'string', onSet: val =>{
            this._title.label.text = val
        }})
    }
}

class sk_ui_dappTitlebar_title extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.styling += ' fullheight'
        this.vertical = false
        this.canMoveView = true

        this.icon = this.add.image(_c => {
            _c.size = 16
            _c.marginRight = 8
            _c.canMoveView = true
        })
        this.label = this.add.label(_c => {
            _c.canMoveView = true
        })
    }
}

class sk_ui_dappTitlebar_actions extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.styling += ' fullheight'
        this.vertical = false

        this.close    = this.add.fromNew(sk_ui_dappTitlebar_actions_button, _c => {
            _c.classAdd('sk_ui_dappTitlebar_actions_button_closeBtn');
            _c.icon = 'close'
            _c.onClick = ()=>{ sk.window.close(this.parent.terminateOnClose) }
        })

        this.maximize = this.add.fromNew(sk_ui_dappTitlebar_actions_button, _c => {
            _c.classAdd('sk_ui_dappTitlebar_actions_button_maximizeBtn')
            _c.onClick = ()=>{ sk.window.maximize() }
        })

        this.minimize = this.add.fromNew(sk_ui_dappTitlebar_actions_button, _c => {
            _c.classAdd('sk_ui_dappTitlebar_actions_button_miniimizeBtn');
            _c.icon = 'minus'
            _c.onClick = ()=>{ sk.window.minimize() }
        })
    }

    configureForOS(os){
        this.classAdd('sk_ui_dappTitlebar_actions_' + os)

        this['configureFor_' + os]()
        
        this.close.configureForOS(os)
        this.maximize.configureForOS(os)
        this.minimize.configureForOS(os)
    }

    configureFor_win(){
        this.minimize.moveBefore(this.close)
        this.maximize.moveBefore(this.close)

        this.maximize.icon = 'square outline'
    }

    configureFor_mac(){
        this.maximize.icon = 'sort'
    }
}

class sk_ui_dappTitlebar_actions_button extends sk_ui_button {
    constructor(parent){
        super(parent)

        this.styling += ' fullheight'

        this.type = 'icon'
    }

    configureForOS(os){
        this.classAdd('sk_ui_dappTitlebar_actions_button_' + os)

        this['configureFor_' + os]()
    }

    configureFor_win(){

    }

    configureFor_mac(){
        
    }
}