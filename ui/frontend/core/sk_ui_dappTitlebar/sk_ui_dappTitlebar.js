class sk_ui_dappTitlebar extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.styling = ' fullwidth'
        this.style.marginBottom = '0px'
        this.height = 12

        /*

        mac layout:
            container
                css: height=16px?, position=relative
                leftside
                    css: height=100%, position=absolute, left=0px
                    window_actions
                        button
                        button
                        button

                content: center middle
                    title
                        logo
                        label

                rightside
                    css: height=100%, position=absolute, right=0px
        */
        
        this.attributes.add({friendlyName: 'OS', name: 'os', type: 'string', onSet: val =>{
            if (val === 'mac'){
                this.classAdd('sk_ui_dappTitlebar_mac')
            } else {
                this.classAdd('sk_ui_dappTitlebar_win')
            }
        }})

        this.attributes.add({friendlyName: 'Closable', name: 'closable', type: 'bool', onSet: val =>{
            
        }})

        this.attributes.add({friendlyName: 'Maximizable', name: 'maximizable', type: 'bool', onSet: val =>{
            
        }})

        this.attributes.add({friendlyName: 'Minimizable', name: 'minimizable', type: 'bool', onSet: val =>{
            
        }})


        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'string', onSet: val =>{
            this.title.icon.url = val
        }})

        this.attributes.add({friendlyName: 'Title', name: 'title', type: 'string', onSet: val =>{
            this.title.label.text = val
        }})
    }
}

class sk_ui_dappTitlebar_title extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.vertical = false

        this.icon = this.add.image(_c => {
            _c.size = 32
            _c.marginRight = 4
        })
        this.label = this.add.label()
    }
}

class sk_ui_dappTitlebar_actions extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.close    = this.add.fromNew(sk_ui_dappTitlebar_actions_button)
        this.maximize = this.add.fromNew(sk_ui_dappTitlebar_actions_button)
        this.minimize = this.add.fromNew(sk_ui_dappTitlebar_actions_button)
    }

    configureForOS(os){
        var func = 'configureFor_' + os
        this[func]()
        this.close[func]()
        this.maximize[func]()
        this.minimize[func]()
    }

    configureFor_win(){
        this.minimize.moveBefore(this.close)
        this.maximize.moveBefore(this.close)
    }

    configureFor_mac(){
        
    }
}

class sk_ui_dappTitlebar_actions_button extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.
    }

    configureForOS(os){

    }

    configureFor_win(){

    }

    configureFor_mac(){
        
    }
}