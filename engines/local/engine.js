const fs = require('fs')
const { app, BrowserWindow, dialog, ipcMain } = require('electron')


module.exports = class SK_LocalEngine extends SK_RootEngine {
    constructor(opt){
        super()

        

        global.ss.app = app
        global.ss.os = require('os')

        const WebSockets_Callback = require('wscb')
        var wscb = new WebSockets_Callback({asElectron: true,
            onUnexpectedMessage: msg => {
                if (msg.cmd === 'terminate') app.quit()
            }
        })
        global.ss.wscb = wscb



        var postsFolder = global.ss.ssModule.opt.postsRoot
        
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
    }

    waitForReady(){
        return new Promise(resolve => {
            app.on('ready', ()=>{
                global.ss.country = app.getLocale().split('-')[0]
                resolve()
            })
        })   
    }

    on(cmd, cb){
        global.ss.wscb.on(cmd, async (msg, rW) => {
            cb(msg, rW)
        })
    }
}