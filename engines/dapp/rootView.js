const { BrowserWindow, screen, Menu } = require('electron')



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
            var defOpts = {
                icon: this.sk.info.paths.icons.app,
                width: 1024,
                height: 750,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableRemoteModule: true,
                    autoplayPolicy: 'no-user-gesture-required',
                },
                backgroundColor: '#2e2c29',
                frame: false
            }
            defOpts = {...defOpts, ...this.info}
            delete defOpts.show

            this.defOpts = defOpts


            resolve()

        
            if (doShow){
                if (!this.sk.info.showWindowWaitTime) this.sk.info.showWindowWaitTime = 1
                
                this.sk.info.showWindowWaitTime += 500

                setTimeout(()=>{
                    try {
                        this.create()
                        this.show()
                    } catch (err) {
                        console.error('[window]', err && err.stack ? err.stack : err)
                    }
                }, this.sk.info.showWindowWaitTime)
            }
        })
    }

    create(){
        this._view = new BrowserWindow(this.defOpts)
        try {
            // After the window exists. The default menu binds Ctrl+C / Ctrl+V / Ctrl+Z
            // as copy/paste/undo, so those keys never arrive at the terminal.
            Menu.setApplicationMenu(null)
        } catch (err) {
            console.error('[menu]', err && err.message ? err.message : err)
        }

        if (this.defOpts.ignoreMouseEvents) this._view.setIgnoreMouseEvents(true)

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
            this.setClosed()
        })

        this._view.on('unresponsive', () => {
            console.error('[window] renderer unresponsive')
        })

        // The page takes a second or two to load; raise once more when it is ready.
        this._view.webContents.once('did-finish-load', () => this.bringToFront())

        this._view.webContents.on('did-fail-load', (_e, code, desc, url) => {
            console.error('[window] did-fail-load', code, desc, url)
        })

        this._view.webContents.on('render-process-gone', (_e, details) => {
            console.error('[window] render-process-gone', details && details.reason, details && details.exitCode)
        })

        this._view.on('session-end' , ()=>{
            this.setClosed()
        })
        //this._view.on('hide'        , ()=>{ this.setClosed() })



        try {
            var menu = new (require(this.sk.info.paths.root + 'menu/' + 'mac' + '.js'))(this._view)
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
        this.info.show = true
        if (!this._view) this.create()
        this._view.show()
        this.bringToFront()
        this.closed = false
        this.alreadyLoaded = false

        this.sk.info.ums.broadcast('sk_view_cmd-' + this.id, {viewID: this.id, action: 'show'})
    }

    bringToFront(){
        // Windows refuses foreground to a process that did not get it from the
        // foreground app, and a launch through the debugger's terminal usually
        // doesn't. The window then opens shown but stacked under the editor.
        // Topmost is not subject to that lock; dropping it right after leaves
        // the window above every normal window.
        const w = this._view
        if (!w || w.isDestroyed()) return
        if (this.defOpts.focusable === false || this.defOpts.ignoreMouseEvents || this.defOpts.alwaysOnTop) return
        try {
            if (w.isMinimized()) w.restore()
            w.setAlwaysOnTop(true)
            w.moveTop()
            w.focus()
            setTimeout(()=>{
                try { if (!w.isDestroyed()) w.setAlwaysOnTop(false) } catch (err) {}
            }, 300)
        } catch (err) {
            console.error('[window]', err && err.message ? err.message : err)
        }
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