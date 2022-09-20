const fs = require('fs')
const { app, BrowserWindow, dialog, ipcMain } = require('electron')


module.exports = class SK_LocalEngine extends SK_RootEngine {
    constructor(opt){
        super()
    }

    init(){
        return new Promise(resolve => {
        

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


            app.on('window-all-closed', () => {
                // On macOS it is common for applications and their menu bar
                // to stay active until the user quits explicitly with Cmd + Q
                if (process.platform !== 'darwin') {
                app.quit()
                }
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