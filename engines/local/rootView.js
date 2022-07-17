const { app, BrowserWindow, dialog, ipcMain } = require('electron')

const ejse = require('ejs-electron')


module.exports = class SK_RootView extends SK_RootViewCore {
    init(opt){
        return new Promise(async resolve => {
            

            this.routes = {
                frontend: {
                    view: opt.root + 'frontend/',

                    ss: global.sk.paths.ss_frontend,

                    ui: global.sk.ui.routes.core,
                    ui_shared: global.sk.ui.routes.shared,

                    app_root: global.sk.paths.root,
                    app: global.sk.paths.app_frontend
                }
            }

            for (var i in this.routes.frontend) this.routes.frontend[i] = this.routes.frontend[i].split('\\').join('/')

            
            if (global.sk.complexity) this.routes.frontend.complexity = global.sk.paths.complexity.frontend

            this.viewInfo = await this._init(opt)
            
            var doShow = this.info.show || false
            var defOpts = {
                icon: __dirname + '/app/assets/img/icon.png',
                width: 1024,
                height: 750,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableRemoteModule: true,
                },
                transparent: true, 
                frame: false
            }
            defOpts = {...defOpts, ...this.info}
            delete defOpts.show

            this.defOpts = defOpts


            resolve()

            if (doShow){
                this.create()
                setTimeout(()=>{
                    this.show()
                }, global.sk.showWindowWWaitTime)

                global.sk.showWindowWWaitTime = 100
            }
        })
    }

    create(){
        this._view = new BrowserWindow(this.defOpts)

        this._view.on('ready-to-show', ()=>{
            this.ipc =  this._view.webContents
        })


        this._view.on('show', ()=>{
            if (this.alreadyLoaded) return
            this.alreadyLoaded = true
        
            ejse.data({
                ...{
                    l10n: {
                        countries: sk.l10n.listCountries(),
                        phrases: sk.l10n.getForCountry(global.sk.country)
                    }
                },

                ...this.viewInfo,
                ...{userData: {}}
            })
            this._view.loadURL('file://' + global.sk.paths.superstructure + '/template.ejs')
        })



        try {
            var menu = new (require(opt.root + 'menu/' + 'mac' + '.js'))(this._view)
        } catch(err) {

        }
    }

    show(){
        if (!this._view) this.create()
        this._view.show()
    }

    hide(){
        this._view.hide()
    }
}