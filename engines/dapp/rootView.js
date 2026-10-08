const { BrowserWindow, screen } = require('electron')
const sk_dapp_pinch = require('./modules/sk_dapp_pinch/sk_dapp_pinch.js')



module.exports = class SK_RootView extends SK_RootViewCore {
    constructor(opt){
        super(opt)
    }
    init(opt){
        return new Promise(async resolve => {
            

            this.routes = {
                frontend: {
                    view: opt.root + 'frontend/',

                    sk: this.sk.info.paths.sk_frontend,

                    ui: this.sk.info.ui.routes.core,
                    ui_shared: this.sk.info.ui.routes.shared,
                    ui_global: this.sk.info.ui.routes.global,

                    app_root: this.sk.info.paths.root,
                    app: this.sk.info.paths.app_frontend,
                    global: this.sk.info.paths.globalFrontend,
                    engine: __dirname,
                },

                
            }

            if (this.info.icon || this.sk.info.paths.icons.view) this.routes.icon = this.info.icon || this.sk.info.paths.icons.view

            function fixPaths(list){
                for (var i in list){
                    if (list[i] instanceof Object) list[i] = fixPaths(list[i])
                    else list[i] = list[i].split('\\').join('/')
                }
                
                return list
            }

            this.routes = fixPaths(this.routes)

            
            if (this.sk.info.complexity) this.routes.frontend.complexity = this.sk.info.paths.complexity.frontend

            this.viewInfo = await this._init(opt)
            
            var doShow = this.info.show || false
            var defaultWebPreferences = {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                autoplayPolicy: 'no-user-gesture-required',
            }
            var defOpts = {
                icon: this.sk.info.paths.icons.app,
                width: 1024,
                height: 750,
                webPreferences: defaultWebPreferences,
                backgroundColor: '#2e2c29',
                frame: false
            }
            defOpts = {...defOpts, ...this.info}
            // A view's own webPreferences add to the defaults instead of replacing them.
            if (this.info.webPreferences) defOpts.webPreferences = {...defaultWebPreferences, ...this.info.webPreferences}
            delete defOpts.show
            // info.icon is the titlebar icon (icon name or image); the OS window keeps the app icon.
            defOpts.icon = this.sk.info.paths.icons.app

            this.defOpts = defOpts


            resolve()

        
            if (doShow){
                if (!this.sk.info.showWindowWaitTime) this.sk.info.showWindowWaitTime = 1
                
                this.sk.info.showWindowWaitTime += 500

                setTimeout(()=>{
                    this.create()
                    this.show()
                }, this.sk.info.showWindowWaitTime)
            }
        })
    }

    create(){
        var wnd = this._view = new BrowserWindow(this.defOpts)

        if (this.defOpts.ignoreMouseEvents) this._view.setIgnoreMouseEvents(true)

        // Page reads this as sk.nativePinch (set before reload() renders the template).
        this.viewInfo.nativePinch = sk_dapp_pinch.attach(this._view)
        // Straight to this window's page over Electron IPC: UMS can't push to a dapp page, so pinches sent
        // that way never arrived (and the page skips Chromium's ctrl+wheel copy while native pinch is on).
        this._view.on('pinch-gesture', data => {
            if (!this._view.isDestroyed()) this._view.webContents.send('sk_be_pinch', data)
        })

        this._view.on('ready-to-show', res => {
            if (!this._view) return
            
            this.ipc =  this._view.webContents
        })


        this._view.on('show', ()=>{
            if (this.alreadyLoaded) return
            this.alreadyLoaded = true
        
            this.reload()
        })

        this._view.on('closed'      , ()=>{
            // A destroyed BrowserWindow can't be shown again; show() creates a fresh one.
            if (this._view === wnd) delete this._view
            this.setClosed()
        })

        this._view.on('session-end' , ()=>{
            this.setClosed()
        })
        //this._view.on('hide'        , ()=>{ this.setClosed() })



        try {
            var menu = new (require(opt.root + 'menu/' + 'mac' + '.js'))(this._view)
        } catch(err) {

        }

        if (this.onAfterCreated) this.onAfterCreated({view: this._view})


        this._view.on('resize', _e => {
            var size = this._view.getSize()
            this.resizeRect = {width: size[0], height: size[1]}
            //this.resizeRect.viewID = this.id

            if (!this.isResizing) this.sk.info.ums.broadcast('sk_be_app_resize_begin-' + this.id, this.resizeRect)
            else this.sk.info.ums.broadcast('sk_be_app_resize-' + this.id, this.resizeRect)
            
            this.isResizing = true
        })
    }

    handleMouseUp(){
        if (!this.isResizing) return
        this.isResizing = false
        this.sk.info.ums.broadcast('sk_be_app_resize_end-' + this.id, this.resizeRect)
    }

    async reload() {
        var userData = {}
        if (this.onForwardUserData) {
            try {
                userData = await this.onForwardUserData()
            } catch (err) {
                console.error(err)
            }
        }

        ejse.data({
            ...{
                l10n: {
                    countries: this.sk.info.l10n.listCountries(),
                    phrases: this.sk.info.l10n.getForCountry(this.sk.country)
                }
            },

            ...this.viewInfo,
            ...{
                userData: userData,
                globalData: this.sk.info.globalData
            }
        })

        this._view.loadURL('file://' + this.sk.info.paths.superkraft + '/template.ejs')
    }

    show(){
        // focusIfOpen views keep their page: bring an open window forward instead of reloading it.
        if (this.info.focusIfOpen && this._view && (this._view.isVisible() || this._view.isMinimized())){
            if (this._view.isMinimized()) this._view.restore()
            this._view.focus()
            return
        }

        this.info.show = true
        if (!this._view) this.create()
        this._view.show()
        this.closed = false
        this.alreadyLoaded = false

        this.sk.info.ums.broadcast('sk_view_cmd-' + this.id, {viewID: this.id, action: 'show'})
    }

    hide(){
        this.info.show = false
        this.sk.info.ums.broadcast('sk_view_cmd-' + this.id, {viewID: this.id, action: 'hide'})
        setTimeout(()=>{
            this._view.hide()
            this.setClosed()
        }, 250)
    }

    close(){
        if (!this._view) return
        this._view.destroy()
        delete this._view
        this.setClosed()
    }

    setClosed(){
        this.closed = true
        if (this.onClosed) this.onClosed()
    }
}