class TitleBar {
    constructor(opt){
        opt = opt || {}


        var tree = {
            div_titlebar: { class: `titlebar ${opt.os} color-face titlebar-movable`, styling: 'c',
                events: {
                    dblclick: ()=>{ sk.window.maximize() }
                },

                div_title: { class: 'title titlebar-movable', styling: 'c m',
                    img_icon: { src: sk.paths.app + 'img/logo_square.png', class: `logo ${(sk.main ? '' : 'hidden')}`, title: 'We <3 U' },
                    div_titleText: { class: 'titlebar-movable', style: 'font-size: 1rem !important;',
                        div_titleLabel: { text: (!opt.title ? 'Splitter Studio' : opt.title) },

                        div_betaLabel: (
                            opt.betaBadge ? {
                                class: 'gradientBG_yellow',
                                style: 'margin-left: 0.5rem; background-color: #ffc900; font-weight: bold; color: black; font-size: 0.6rem; border-radius: 0.25rem; padding: 0rem 0.5rem;',
                                text: 'BETA'
                            }
                            :
                            {}
                        )
                    }
                },

                div_windowActions: { class: 'windowActions ' + opt.os }
            }
        }

        if (opt.noTitle) delete tree.div_titlebar.div_title

        this.bucket = JSOM.parse({root: opt.parent, tree: tree})

        var addActionBtn = action => {
            var icons = {
                close: 'close',
                minimize: 'minus',
                maximize: (opt.os === 'win32' ? 'square outline' : 'sort')
            }

            var tree = {
                div_windowActionBtn: { class: `titleBarActionBtn ${opt.os} ${action}Btn`, styling: 'c',
                    i_icon: { class: `${icons[action]} icon` },
                    events: {
                        click: ()=>{
                            sk.window[action]()
                        }
                    }
                },
            }

            JSOM.parse({root: this.bucket.windowActions, tree: tree})
        }

        if (opt.os === 'win32'){
            if (sk.window.minimizable) addActionBtn('minimize')
            if (sk.window.maximizable) addActionBtn('maximize')
            if (sk.window.closable) addActionBtn('close')
        } else {
            if (sk.window.closable) addActionBtn('close')
            if (sk.window.minimizable) addActionBtn('minimize')
            if (sk.window.maximizable) addActionBtn('maximize')
        }

        
        
    }
}