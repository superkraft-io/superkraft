const { app, BrowserWindow, dialog, ipcMain } = require('electron')

const ejse = require('ejs-electron')


module.exports = class SK_RootView extends SK_RootViewCore {
    constructor(opt){
        super(opt)
    }
    init(opt){
        return new Promise(async resolve => {
            

            this.routes = {
                frontend: {
                    view: opt.root + 'frontend/',

                    sk: this.sk.paths.sk_frontend,

                    ui: this.sk.ui.routes.core,
                    ui_shared: this.sk.ui.routes.shared,
                    ui_global: this.sk.ui.routes.global,

                    app_root: this.sk.paths.root,
                    app: this.sk.paths.app_frontend,
                    global: this.sk.paths.globalFrontend
                },

                icon: this.info.icon || this.sk.paths.icons.view,
            }

            function fixPaths(list){
                for (var i in list){
                    if (list[i] instanceof Object) list[i] = fixPaths(list[i])
                    else list[i] = list[i].split('\\').join('/')
                }

                return list
            }

            this.routes = fixPaths(this.routes)

            
            if (this.sk.complexity) this.routes.frontend.complexity = this.sk.paths.complexity.frontend

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
                if (!this.sk.showWindowWWaitTime) this.sk.showWindowWWaitTime = 1
                
                this.sk.showWindowWWaitTime += 500

                setTimeout(()=>{
                    this.create()
                    this.show()
                }, this.sk.showWindowWWaitTime)
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
        
            this.reload()
        })

        this._view.on('closed'      , ()=>{ this.setClosed() })
        this._view.on('session-end' , ()=>{ this.setClosed() })
        //this._view.on('hide'        , ()=>{ this.setClosed() })



        try {
            var menu = new (require(opt.root + 'menu/' + 'mac' + '.js'))(this._view)
        } catch(err) {

        }

        if (this.onAfterCreated) this.onAfterCreated({view: this._view})
    }

    reload(){
        ejse.data({
            ...{
                l10n: {
                    countries: this.sk.l10n.listCountries(),
                    phrases: this.sk.l10n.getForCountry(this.sk.country)
                }
            },

            ...this.viewInfo,
            ...{
                userData: {},
                globalData: this.sk.globalData
            }
        })

        this._view.loadURL('file://' + this.sk.paths.superkraft + '/template.ejs')
    }

    show(){
        if (!this._view) this.create()
        this._view.show()
        this.closed = false
        this.sk.ums.broadcast('sk_view_cmd-' + this.id, {viewID: this.id, action: 'show'})
    }

    hide(){
        this.sk.ums.broadcast('sk_view_cmd-' + this.id, {viewID: this.id, action: 'hide'})
        setTimeout(()=>{
            this._view.hide()
            this.setClosed()
        }, 250)
    }

    close(){
        if (!this._view) return
        this._view.close()
    }

    setClosed(){
        this.closed = true
        if (this.onClosed) this.onClosed()
    }
}