var fs = require('fs')

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
            var viewsToLoad = fs.readdirSync(this.sk.paths.views)
            
            this.sk.viewList = []

            for (var i = 0; i < viewsToLoad.length; i++){
                var viewName = viewsToLoad[i]
                
                if (viewName.toLocaleLowerCase().indexOf('.ds_store') > -1) continue

                var viewRoot = this.sk.paths.views + viewName + '/'
                var viewPath = viewRoot + 'main.js'
                try {
                    var view = new (require(viewPath))({sk: this.sk})
                    view.root = viewRoot
                    if (view.info.mainRedirect){
                        view = new (require(view.info.mainRedirect))({sk: this.sk})
                    }
                    
                    var priority = view.info.priority || 0

                    if (!priorities[priority]) priorities[priority] = []
                    priorities[priority].push({name: viewName, view: view})
                   
                    this.sk.viewList.push(viewName)

                    console.log('[SUCCESS] View loaded: ' + viewName)
                } catch(err) {
                    console.error('[ERROR] Could not load view %s', viewName)
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
                            root: this.sk.paths.views + info.name + '/'
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