const fs = require('fs')

var _electron =  require('electron')
const { app } = _electron

var _os = require('os')

const {uIOhook, UiohookKey} = require('uiohook-napi')

global.ejse = require('ejs-electron')

module.exports = class SK_LocalEngine extends SK_RootEngine {
    constructor(opt){
        super(opt)
        this.getSysInfo()
    }

    getSysInfo(){
        var os = _os.platform()
        if (os === 'darwin') os = 'macos'
        else os = 'win'


        var arch = 'x64'
       if (_os.cpus()[0].model.includes('Apple')) arch = 'arm'

        this.sk.sysInfo = {
            os: os,
            arch: arch
        }

    }

    init(){
        return new Promise(resolve => {
            this.sk._os = _os
            this.sk.app = app
            this.app = app

            
            
            
            const WebSockets_Callback = require('wscb')
            var wscb = new WebSockets_Callback({asElectron: true,
                onUnexpectedMessage: msg => {
                    if (msg.cmd === 'terminate') app.quit()
                }
            })
            this.sk.wscb = wscb



            var postsFolder = this.sk.skModule.opt.postsRoot
            
            this.posts = {}

            var posts = fs.readdirSync(postsFolder)
            posts.forEach(_filename => {
                var postName = _filename.split('.')[0]
                    try {
                    var postModule = new (require(postsFolder + _filename))({sk: this.sk})

                    this.posts[postName] = postModule
                    
                    this.on(postModule.info.route, async (req, res)=>{
                        postModule.exec(req, res)
                    })
                } catch(err) {
                    console.error(err)
                }
            })


            app.on('window-all-closed', () => {
                // On macOS it is common for applications and their menu bar
                // to stay active until the user quits explicitly with Cmd + Q
                /*if (this.sk.sysInfo.os !== 'macos'){
                    app.exit()
                }
                */

                this.terminate()
            })
            
            /*
            app.on('activate', () => {
                // On macOS it's common to re-create a window in the
                // app when the dock icon is clicked and there are no
                // other windows open.
                if (BrowserWindow.getAllWindows().length === 0){
                    createWindow()
                }
            })*/

            

            this.sk.ums = new (require('../../modules/sk_ums.js'))({sk: this.sk, app: app})
            
            this.sk.online = false
            this.sk.ums.on('isOnline', res => {
                this.sk.online = res.data
            })


            

            resolve()
        })
    }

    async waitForReady(){
        await app.whenReady()
        ejse.listen()
    
        this.deeplink = new (require('./modules/sk_dapp_deeplink.js'))({sk: this.sk})
        this.sk.country = app.getLocale().split('-')[0]

        if (this.sk.onAppReady) this.sk.onAppReady()

        uIOhook.on('mouseup', _e => {
            for (var vid in this.sk.views) this.sk.views[vid].handleMouseUp()
        })
        uIOhook.start()
    }

    on(cmd, cb){
        this.sk.wscb.on(cmd, async (msg, rW) => {
            cb(msg, rW)
        })
    }

    async terminate(){
        this.closeAllViews()
        this.sk.timers.destroyAll()

        if (this.sk.onBeforeTerminate) await this.sk.onBeforeTerminate()

        process.exit()
    }

    closeAllViews(){
        for (var i in this.sk.views){
            var view = this.sk.views[i]
            if (view.closed === false) view.close()
        }
    }

    flog(data){
        this.sk.ums.broadcast('sk_flog', data)
    }


    onViewsInitialized(){
        for (var i in this.sk.views){
            var view = this.sk.views[i]
            view.onClosed = ()=>{ this.onViewClosed() }
        }
    }

    checkIfAllViewsClosed(){
        var created = []

        for (var i in this.sk.views){
            var view = this.sk.views[i]
            var _view = view._view
            if (_view) created.push(view)
        }

        if (created.length === 0) return

        for (var i in created){
            var view = created[i]
            if (view.closed === false) return
        }
        
        return true
    }

    onViewClosed(){
        if (this.checkIfAllViewsClosed()) this.terminate()
    }
}