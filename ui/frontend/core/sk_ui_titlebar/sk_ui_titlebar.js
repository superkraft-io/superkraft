class sk_ui_titlebar extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.classAdd('sk_window_drag')

        this.styling += ' fullwidth'

        this.vertical = 'none'
        
        this.attributes.add({friendlyName: 'OS', name: 'os', type: 'string', onSet: val =>{
            var os = 'windows'
            if (val.indexOf('macos') > -1) os = 'macos'

            this.classAdd('sk_ui_titlebar_' + os)

            
            this._actions = this.add.fromNew(sk_ui_titlebar_actions, _c => _c.configureForOS(os))
            this._title   = this.add.fromNew(sk_ui_titlebar_title)
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

        sk_api.window.on('maximize', _e => {
            if (this._actions.maximize.handleMaximized) this._actions.maximize.handleMaximized()
        })

        sk_api.window.on('enter-full-screen', _e => {
            if (this._actions.maximize.handleMaximized) this._actions.maximize.handleMaximized()
        })

        sk_api.window.on('unmaximize', _e => {
            if (this._actions.maximize.handleUnmaximized) this._actions.maximize.handleUnmaximized()
        })

        sk_api.window.on('leave-full-screen', _e => {
            if (this._actions.maximize.handleUnmaximized) this._actions.maximize.handleUnmaximized()
        })
    }
}

class sk_ui_titlebar_title extends sk_ui_component {
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
            _c.text = sk_api.staticInfo.application.name
        })
    }
}

class sk_ui_titlebar_actions extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling += ' fullheight'
        this.vertical = false

        this.close    = this.add.fromNew(sk_ui_titlebar_actions_button, _c => {
            _c.classAdd('sk_ui_titlebar_actions_button_closeBtn');
            _c.icon = 'close'
            _c.onClick = ()=>{
                sk_api.window.close()
            }
        })

        this.maximize = this.add.fromNew(sk_ui_titlebar_actions_button, _c => {
            _c.classAdd('sk_ui_titlebar_actions_button_maximizeBtn')
            _c.onClick = async ()=>{
                var isMaximized = await sk_api.window.isMaximized()
                var isFullscreen = await sk_api.window.isFullScreen()

                if (!isMaximized && !isFullscreen) sk_api.window.maximize()
                else sk_api.window.unmaximize()
            }
        })

        this.minimize = this.add.fromNew(sk_ui_titlebar_actions_button, _c => {
            _c.classAdd('sk_ui_titlebar_actions_button_minimizeBtn');
            _c.icon = 'window minimize outline'
            _c.onClick = ()=>{
                sk_api.window.minimize()
            }
        })
    }

    configureForOS(os){
        this.classAdd('sk_ui_titlebar_actions_' + os)

        this['configureFor_' + os]()
        
        this.close.configureForOS(os, 'close')
        this.maximize.configureForOS(os, 'maximize')
        this.minimize.configureForOS(os, 'minimize')

        if (!sk.window.closable    ) this.close.remove()
        if (!sk.window.maximizable ) this.maximize.remove()
        if (!sk.window.minimizable ) this.minimize.remove()
    }

    configureFor_windows(){
        this.minimize.moveBefore(this.close)
        this.maximize.moveBefore(this.close)
        this.maximize.icon = 'square outline'

         this.maximize.handleMaximized = ()=>{
            this.maximize.icon = 'window restore outline'
        }

        this.maximize.handleUnmaximized = ()=>{
            this.maximize.icon = 'square outline'
        }
    }

    configureFor_macos(){
        this.minimize.moveBefore(this.maximize)
        
        this.maximize._icon.remove()
        
        this.maximize.add.component(_c => {
            _c.classAdd('sk_ui_titlebar_actions_button_macos_maximize_arrow_container')
            _c.compact = true

            this.maximize.arrow_top_left = _c.add.component(_c => {
                _c.style.width = 0
                _c.style.height = 0
                _c.style.borderLeft = '3px solid transparent'
                _c.style.borderRight = '3px solid transparent'
                _c.style.borderBottom = '3px solid black'
                
                _c.marginBottom = 2
            })

            this.maximize.arrow_bottom_right = _c.add.component(_c => {
                _c.style.width = 0
                _c.style.height = 0
                _c.style.borderLeft = '3px solid transparent'
                _c.style.borderRight = '3px solid transparent'
                _c.style.borderTop = '3px solid black'
            })
        })

        this.maximize.handleMaximized = ()=>{
            this.maximize.arrow_top_left.style.transform = 'rotate(180deg)'
            this.maximize.arrow_bottom_right.style.transform = 'rotate(180deg)'
            this.maximize.arrow_top_left.marginBottom = 0.001
        }

        this.maximize.handleUnmaximized = ()=>{
            this.maximize.arrow_top_left.style.transform = ''
            this.maximize.arrow_bottom_right.style.transform = ''
            this.maximize.arrow_top_left.marginBottom = 2
        }

        this.minimize.icon = 'minus'
    }


}

class sk_ui_titlebar_actions_button extends sk_ui_button {
    constructor(opt){
        super(opt)
        this.type = 'icon'
    }

    configureForOS(os, action){
        this.classAdd('sk_ui_titlebar_actions_button_' + os)
        this.classAdd('sk_ui_titlebar_actions_button_' + os + '_' + action)
        this['configureFor_' + os](os, action)

        if (os === 'windows'){
            this._icon.size = 12
        }
    }

    configureFor_windows(os, action){
    }

    configureFor_macos(os, action){
    }
}