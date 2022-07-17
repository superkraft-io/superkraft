const fs = require('fs')
const { app, BrowserWindow, dialog, ipcMain } = require('electron')


module.exports = class SK_LocalEngine extends SK_RootEngine {
    constructor(opt){
        super()

        

        global.sk.app = app
        global.sk.os = require('os')

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
    }

    waitForReady(){
        return new Promise(resolve => {
            app.on('ready', ()=>{
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
}