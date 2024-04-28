if (global){
    global.window = {_sk_app_type_is_ssc: false}
} else {
    window = {_sk_app_type_is_ssc: true}
}

module.exports = class Superkraft {
    constructor(opt){
        this.opt = opt
        this.init(opt)
    }

    async init(opt){
        global.sk_fs = new (require(__dirname + '/modules/sk_fs/sk_fs.js'))({app_type: opt.type})
        

        var sk_id = opt.sk_id || 'sk'
        this.info = {
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

                globalActions: opt.globalActions,
                globalFrontend: opt.globalFrontend,

                posts: opt.postsRoot,

                vanillaFrontend: opt.vanillaFrontend,
            },

            globalData: opt.globalData || {},
            dynamicGlobalData: opt.dynamicGlobalData,

            database: opt.database,
            l10n: opt.l10n,

            modules: {},
            
            views: {},

            useComplexity: opt.useComplexity,

            country: 'en',

            headers: opt.headers || {},
            csp: opt.csp || {},

            dapp: opt.dapp || {},
            mobile: opt.mobile || {},

            ui: opt.ui || {},

            cdn: opt.cdn,

            ports: opt.ports || {},

            onAppReady: opt.onAppReady
        }
        
        global[sk_id] = this.info
        var sk = this.info

        this.info.utils = new (require(__dirname + '/modules/sk_utils.js'))({sk: sk})
        this.info.timers = (opt.type === 'dapp' ? new (require(__dirname + '/modules/sk_timers.js'))({sk: sk}) : undefined)
        this.info.stats = new (require(__dirname + '/modules/sk_stats.js'))({sk: sk})

       if(opt.type === 'sapp') this.info.paths.extensions = opt.extensions

        sk.paths.sk_frontend = sk.paths.superkraft + 'frontend/'


        /****************/

        sk.paths.sk_ui = {root: sk.paths.superkraft + 'ui/'}
        sk.paths.sk_ui.backend = sk.paths.sk_ui.root + 'backend/'
        sk.paths.sk_ui.frontend = {
            core: sk.paths.sk_ui.root + 'frontend/core/',
            shared: opt.projectRoot + '/frontend/sk_ui/',
            global: opt.globalFrontend + 'sk_ui/'
        }
        sk.ui = new (require(sk.paths.sk_ui.backend + 'sk_ui.js'))({
            sk: sk,
            endpoint: opt.type,
            paths: sk.paths.sk_ui 
        })
        await sk.ui.refresh()

        
        /****************/
        
        if (opt.config) sk.config = JSON.parse(await sk_fs.promises.readFile(opt.config))

        /****************/
        global.SK_Root_POST = require(sk.paths.sk_modules + 'sk_root_POST.js')
        global.SK_RootAction = require(sk.paths.sk_modules + 'sk_rootAction.js')
        

        if (opt.useComplexity) sk.complexity = new (require(__dirname + '/complexity/backend/sk_complexity.js'))

        global.SK_RootEngine = require(__dirname + '/sk_rootEngine.js')
        sk.engine = new (require(__dirname + '/engines/' + opt.type + '/engine.js'))({sk: sk})
        
        try { await sk.engine.init() } catch(err) {
            console.error(err)
            if (opt.onFail) return opt.onFail()
        }
        
        global.SK_RootViewCore = require(__dirname + '/sk_rootViewCore.js')
        global.SK_RootView = require(__dirname + '/engines/' + opt.type + '/rootView.js')
        
       
        

        if (opt.useComplexity) sk.complexity.init()

        
        sk.actions = await sk.utils.loadActions([__dirname, 'engines', opt.type, 'global_actions'].join('/') + '/')
        sk.utils.captureActions('root', sk.actions)

        sk.globalActions = await sk.utils.loadActions(sk.paths.globalActions)

        if (opt.onPreStart) opt.onPreStart()
        
        await sk.engine.waitForReady()
        await sk.engine.initViews()

        if (opt.type === 'wapp' && opt.cdn && opt.cdn.export){
            console.log('[SK] Exporting CDN content...')
            var cdnExporter = new (require(__dirname + '/modules/sk_cdnExporter.js'))({sk: sk})
            await cdnExporter.export()
            console.log('[SK] Done!')
            //process.exit()
            //return
        }

        if (sk.engine.start) await sk.engine.start()
        
        if (opt.onReady) opt.onReady()
    }
}

