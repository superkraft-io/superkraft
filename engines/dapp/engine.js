const fs = require('fs')

var _electron =  require('electron')
const { app, BrowserWindow, dialog, ipcMain } = _electron


var _os = require('os')


module.exports = class SK_LocalEngine extends SK_RootEngine {
    constructor(opt){
        super()
        this.getSysInfo()
    }

    getSysInfo(){
        var os = _os.platform()
        if (os === 'darwin') os = 'macos'
        else os = 'win'


        var arch = 'x64'
       if (global.sai.os.cpus()[0].model.includes('Apple')) arch = 'arm'

        global.sk.sysInfo = {
            os: os,
            arch: arch
        }

    }

    init(){
        return new Promise(resolve => {
            global.sk._os = _os
            global.sk.app = app
            this.app = app

            
            const WebSockets_Callback = require('wscb')
            var wscb = new WebSockets_Callback({asElectron: true,
                onUnexpectedMessage: msg => {
                    if (msg.cmd === 'terminate') app.quit()
                }
            })
            global.sk.wscb = wscb



            var postsFolder = global.sk.skModule.opt.postsRoot
            
            this.posts = {}

            var posts = fs.readdirSync(postsFolder)
            posts.forEach(_filename => {
                var postName = _filename.split('.')[0]
                    try {
                    var postModule = new (require(postsFolder + _filename))()

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
                /*if (global.sk.sysInfo.os !== 'macos'){
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


            global.sk.ums = new (require('../../modules/sk_ums.js'))({app: app})
            
            sk.online = false
            global.sk.ums.on('isOnline', res => {
                sk.online = res.data
            })

            resolve()
        })
    }

    waitForReady(){
        return new Promise(resolve => {
            app.on('ready', ()=>{
                this.deeplink = new (require('./modules/sk_dapp_deeplink.js'))()
                global.sk.country = app.getLocale().split('-')[0]
                resolve()
            })
        })   
    }

    on(cmd, cb){
        global.sk.wscb.on(cmd, async (msg, rW) => {
            cb(msg, rW)
        })
    }

    async terminate(){
        this.closeAllViews()
        global.sk.timers.destroyAll()

        if (global.sk.onBeforeTerminate) await global.sk.onBeforeTerminate()

        process.exit()
    }

    closeAllViews(){
        for (var i in global.sk.views){
            var view = global.sk.views[i]
            if (view.closed === false) view.close()
        }
    }

    flog(data){
        global.sk.ums.broadcast('sk_flog', data)
    }


    onViewsInitialized(){
        for (var i in global.sk.views){
            var view = global.sk.views[i]
            view.onClosed = ()=>{ this.onViewClosed() }
        }
    }

    checkIfAllViewsClosed(){
        var created = []

        for (var i in global.sk.views){
            var view = global.sk.views[i]
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