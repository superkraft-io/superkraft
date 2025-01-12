console.log('SK++ engine')

var app = new (require('./modules/skxx_electron/skxx_electron_app.js'))()
var _os = require('os')

module.exports = class SKXX_Engine extends SK_RootEngine {
    constructor(opt){
        super(opt)

        this.ui = {
            root: 'sk_param_component_root'
        }

        this.getSysInfo()
    }

    getSysInfo(){
        var os = _os.platform()
        if (os === 'darwin') os = 'macos'
        else os = 'win'


        var arch = 'x64'
        var cpus = _os.cpus()
        if (cpus[0].model.includes('Apple')) arch = 'arm'

        this.sk.info.sysInfo = {
            os: os,
            arch: arch
        }

    }

    init(){
        return new Promise(async resolve => {
            this.__init()

            this.sk.info._os = _os
            this.sk.info.app = app
            this.app = app


            await app.__init__()


            this.nativeActionsLoader = new (require('./modules/skxx_nativeActionsLoader.js'))()
            this.nativeActionsLoader.sk = this.sk

            
            
            //var wscb = new (require(__dirname + '/modules/sk_sapp_wscb_wrapper'))({
            /*var wscb = new (require(__dirname + '/frontend/websockets-callback/lib/wscb.js'))({
                sk: this.sk,
                'as_SK++': true,
                asClient: true,
                onUnexpectedMessage: msg => {
                    if (msg.cmd === 'terminate') app.quit()
                }
            })
            wscb.test()
            this.sk.wscb = wscb
            */


            this.initPosts()


            app.on('window-all-closed', () => {
                // On macOS it is common for applications and their menu bar
                // to stay active until the user quits explicitly with Cmd + Q
                /*if (this.sk.info.sysInfo.os !== 'macos'){
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

            setTimeout(()=>{
                app.setAppReady()
            }, 200)

            resolve()
        })
    }

    waitForReady(){
        return new Promise(resolve => {
            if (app.__appIsReady) return resolve()
            
            app.on('ready', async ()=>{
                //this.deeplink = new (require('./modules/sk_dapp_deeplink.js'))({sk: this.sk})
                this.sk.country = app.getLocale().split('-')[0]

                if (this.sk.onAppReady) await this.sk.onAppReady()

                resolve()
            })
        })   
    }

    on(cmd, cb){
        sk_api.ipc.on(cmd, async (msg, rW)=>{
            return await cb(msg, rW)
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
        this.sk.info.ums.broadcast('sk_flog', data)
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


    async initPosts(){
        if (!this.sk.opt.postsRoot) return

        try {
            await sk_fs.promises.access(this.sk.opt.postsRoot)
        } catch(err) {
            return console.error(`[ ERROR: SAPP ENGINE ] initPosts(): posts folder path has been defined but post folder does not exist`)
        }

        var postsFolder = this.sk.opt.postsRoot
            
        this.posts = {}

        var posts = await sk_fs.promises.readdir(postsFolder)
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
    }
}