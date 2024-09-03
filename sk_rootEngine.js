module.exports = class SK_RootEngine {
    constructor(opt){
        this.sk = opt.sk
       
    }

    __init() {
        this.paths = {
            frontend: {
                sk: this.sk.info.paths.sk_frontend,
                ui: {
                    core: this.sk.info.ui.paths.frontend.core,
                    shared: this.sk.info.ui.paths.frontend.shared,
                    view: this.sk.info.ui.paths.frontend.view,
                    global: this.sk.info.ui.paths.frontend.global
                },
                app: this.sk.info.paths.app_frontend,
            }
        }
    }

    async loadPosts(){
        var postsFolder = this.sk.info.skModule.opt.postsRoot
        try { await sk_fs.promises.access(postsFolder) } catch(err) { return console.warn('No posts found') }
        
        this.posts = {}


        var addPostModule = postModule => {
            this.sk.app.post('/' + postModule.info.route, async (req, res)=>{
                //var _sw = this.sk.stats.increment({type: 'post', route: postModule.info.route})
        
                var _res = {}
                var reject = msg => {
                    _res.rejected = true
                    _res.error = msg
                    res.send(_res)
                    return
                }

                if (postModule.info.protected){
                    if (!req.cookies){
                        var x = 0
                        return reject('invalid_request')
                    }
                    var auth_token = req.cookies.auth_token
                    if (!auth_token) return reject('access_denied')
                    var isAuthTokenValid = await this.sk.info.engine.isAuthTokenValid(auth_token)
                    if (isAuthTokenValid === 'invalid_token') return reject('invalid_token')
                    if (!isAuthTokenValid) return reject('access_denied')
                }

                try {
                    var json = JSON.parse(req.body.data)
                    req.body.data = json
                } catch(err) {

                }
                
                postModule.exec(req, res)

                //_sw.end()
            })
        }


        var posts = await sk_fs.promises.readdir(postsFolder)
        for (var i = 0; i < posts.length; i++) {
            var _filename = posts[i]
            var split = _filename.split('.')
            var ext = split[split.length - 1]
            if (ext !== 'js') continue
            
            if ((await sk_fs.promises.stat(postsFolder + _filename)).isDirectory() === true) return

            var postName = _filename.split('.')[0]
            try {
                var postModule = new (require(postsFolder + _filename))({sk: this.sk})

                this.posts[postName] = postModule
                
                addPostModule(postModule)
            } catch(err) {
                console.error(err)
            }
        }

    }

    initViews(){
        return new Promise(async resolve => {

            var priorities = {}

            console.log('Loading views...')
            var viewsToLoad = await sk_fs.promises.readdir(this.sk.info.paths.views)
           
            var viewInfoArray = []
            for (var i = 0; i < viewsToLoad.length; i++){
                var viewName = viewsToLoad[i]
                
                if (viewName.toLocaleLowerCase().indexOf('.ds_store') > -1) continue

                viewInfoArray.push({
                    name: viewName,
                    path: this.sk.info.paths.views + viewName + '/'
                })
            }

            /*if (this.sk.info.type === 'dapp'){
                var sk_dapp_cursor_path = __dirname + '/engines/dapp/modules/sk_dapp_cursor/'
                if (sk_fs.existsSync(sk_dapp_cursor_path)) viewInfoArray.push({name: 'sk_dapp_cursor', path: sk_dapp_cursor_path})
            }*/

            this.sk.viewList = []

            for (var i = 0; i < viewInfoArray.length; i++){
                var viewInfo = viewInfoArray[i]
                var viewPath = viewInfo.path + 'main.js'
                try {
                    var view = new (require(viewPath))({sk: this.sk})
                    if (view.info.mainRedirect){
                        view = new (require(view.info.mainRedirect))({sk: this.sk})
                        view.root = viewInfo.path
                    }
                    view.root = viewInfo.path
                    
                    
                    var priority = view.info.priority || 0

                    if (!priorities[priority]) priorities[priority] = []
                    priorities[priority].push({
                        name: viewInfo.name,
                        view: view,
                        root: view.root
                    })
                   
                    this.sk.viewList.push(viewInfo.name)

                    console.log('[SUCCESS] View loaded: ' + viewInfo.name)
                } catch(err) {
                    console.error('[ERROR] Could not load view %s', viewInfo.name)
                    console.error(err)
                }
            }
            
            console.log('')

            console.log('Initializing views...')
            for (var _p in priorities){
                var viewsToInit = priorities[_p]
                for (var i in viewsToInit){
                    var info = viewsToInit[i]
                
                    try {
                        await info.view.init({
                            id: info.name,
                            root: info.root
                        })

                        this.sk.info.views[info.name] = info.view
                        console.log('[SUCCESS] View initialized: ' + info.name)
                    } catch(err) {
                        console.error('[ERROR] Could not initialize view %s', info.name)
                    }
                }
                    
            }

            if (this.onViewsInitialized) this.onViewsInitialized()
            
            resolve()
        })
    }
}