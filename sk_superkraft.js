var fs = require('fs')

module.exports = class Superkraft {
    constructor(opt){
        this.opt = opt
        this.init(opt)
    }

    async init(opt){
        global.sk = {
            skModule: this,
            type: opt.type,
            paths: {
                root: opt.root + '/',
                superkraft: __dirname + '/',
                sk_modules: __dirname + '/modules/',
                views: opt.projectRoot + '/views/',
                app_frontend: opt.projectRoot + '/frontend/',
                templates: opt.templates,
                icons: opt.icons,

                globalActions: opt.globalActions
            },

            database: opt.database,
            l10n: opt.l10n,

            modules: {},
            utils: new (require('./modules/sk_utils.js'))(),
            views: {},

            useComplexity: opt.useComplexity,

            country: 'en'
        }
        var sk = global.sk

        if (sk.type === 'dapp'){
            sk.online = false
            sk.onOnlineChanged = opt.onOnlineChanged
        }

        sk.paths.sk_frontend = sk.paths.superkraft + 'frontend/'

        /****************/
        
        sk.paths.sk_ui = {root: sk.paths.superkraft + 'ui/'}
        sk.paths.sk_ui.backend = sk.paths.sk_ui.root + 'backend/'
        sk.paths.sk_ui.frontend = {
            core: sk.paths.sk_ui.root + 'frontend/core/',
            shared: opt.projectRoot + '/frontend/sk_ui/',
        }
        sk.ui = new (require(sk.paths.sk_ui.backend + 'sk_ui.js'))({
            endpoint: opt.type,
            paths: sk.paths.sk_ui 
        })

        /****************/
        
        if (opt.config) sk.config = JSON.parse(fs.readFileSync(opt.config))

        /****************/

        global.SK_RootAction = require(global.sk.paths.sk_modules + 'sk_rootAction.js')
        

        if (opt.useComplexity) global.sk.complexity = new ( require(__dirname + '/complexity/backend/sk_complexity.js'))


        global.SK_RootViewCore = require('./sk_rootViewCore.js')
        global.SK_RootView = require('./engines/' + opt.type + '/rootView.js')
        global.SK_RootEngine = require('./sk_rootEngine.js')
        sk.engine = new (require('./engines/' + opt.type + '/engine.js'))()

        if (opt.useComplexity) global.sk.complexity.init()

        
        sk.actions = sk.utils.loadActions(__dirname + '/engines/' + opt.type + '/global_actions/')
        sk.utils.captureActions('root', sk.actions)

        
        await sk.engine.waitForReady()
        await sk.engine.initViews()

        if (sk.engine.start) await sk.engine.start()
    }
}

