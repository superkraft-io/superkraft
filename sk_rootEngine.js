module.exports = class sk_RootEngine {
    constructor(opt){
        this.sk = opt.sk
        this.paths = {
            frontend: {
                sk: this.sk.paths.sk_frontend,
                ui: {
                    core   : this.sk.ui.paths.frontend.core,
                    shared : this.sk.ui.paths.frontend.shared,
                    view   : this.sk.ui.paths.frontend.view,
                    global : this.sk.ui.paths.frontend.global
                },
                app: this.sk.paths.app_frontend,
            }
        }
    }

    initViews(){
        return new Promise(async resolve => {

            var priorities = {}

            console.log('Loading views...')
            var viewsToLoad = await sk_fs.promises.readdir(this.sk.paths.views)
           
            var viewInfoArray = []
            for (var i = 0; i < viewsToLoad.length; i++){
                var viewName = viewsToLoad[i]
                
                if (viewName.toLocaleLowerCase().indexOf('.ds_store') > -1) continue

                viewInfoArray.push({
                    name: viewName,
                    path: this.sk.paths.views + viewName + '/'
                })
            }

            /*if (this.sk.type === 'dapp'){
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

                        this.sk.views[info.name] = info.view
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