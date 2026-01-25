console.log('SK++ engine')

//var app = new (require('./modules/skxx_electron/skxx_electron_app.js'))()
var { app } = require('proton')
var _os = require('os')

window.ejs_skxx = new (require(__dirname + '/modules/ejs_skxx/ejs_skxx.js'))()

module.exports = class SKXX_Engine extends SK_RootEngine {
    constructor(opt){
        super(opt)
        console.log('------------- SKXX_Engine constructor')

        this.ui = {
            root: 'sk_param_component_root'
        }

        this.getSysInfo()

        window.ejs_skxx.init()
    }

    getSysInfo(){
        var os = _os.platform()
        if (os === 'darwin') os = 'mac'
        else os = 'win'


        var arch = 'x64'
        var cpus = _os.cpus()
        if (cpus[0].model.includes('Apple')) arch = 'arm'

        this.sk.info.sysInfo = {
            os: os,
            arch: arch
        }

    }

    async startOnlineMonitoring(){
        var busy = false

        var doOnce = async ()=>{
            sk.online = await sk.info.utils.checkInternetDNS()
            sk.info.ums.broadcast('isOnline', undefined, sk.online)
        }

        var waitForUMS = ()=>{
            return new Promise(resolve => {
                var check = setInterval(()=>{
                    if (sk.info.ums){
                        clearInterval(check)
                        resolve()
                    }
                }, 1000)
            })
        }
    
        await waitForUMS()

        setInterval(async()=>{
            if (busy) return
            busy = true
            await doOnce()
            busy = false
        }, 3000)

        doOnce()
    }

    init(){
        this.startOnlineMonitoring()
        
        return new Promise(async resolve => {
            this.sk.info._os = _os
            this.sk.info.app = app
            this.app = app


            this.initPosts()


            app.on('window-all-closed', () => {
                // On mac it is common for applications and their menu bar
                // to stay active until the user quits explicitly with Cmd + Q
                /*if (this.sk.info.sysInfo.os !== 'mac'){
                    app.exit()
                }
                */

                this.terminate()
            })
            
            /*
            app.on('activate', () => {
                // On mac it's common to re-create a window in the
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
        
        //this.deeplink = new (require('./modules/sk_dapp_deeplink.js'))({sk: this.sk})
        this.sk.country = app.getLocale().split('-')[0]

        if (this.sk.onAppReady) await this.sk.onAppReady()
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
            return console.error(`[ ERROR: SK++ ENGINE ] initPosts(): posts folder path has been defined but post folder does not exist`)
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