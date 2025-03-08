if (global){
    global.window = {_sk_app_type: 'wapp'}
} else {
    window = { _sk_app_type: 'wapp' }
}

module.exports = class Superkraft {
    constructor(opt){
        this.opt = opt

        this.init(opt)
    }

    async init(opt){
        

        var sk_id = opt.sk_id || 'sk'

        if (window) window[sk_id] = this
        if (global) global[sk_id] = this

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

            modules: {
                validator: new (require(__dirname + '/modules/sk_validator.js'))()
            },
            
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

        global.window._sk_app_type = opt.type

        this.ipc = new (require('./modules/sk_ipc/sk_ipc.js'))({ sk: this, source: 'sk_be' })
        global.sk_ipc = this.ipc
        window.sk_ipc = this.ipc


        global.sk_fs = new (require(__dirname + '/modules/sk_fs/sk_fs.js'))({ sk: this, app_type: opt.type })


        /****************/
        
        for (var i in this.info.paths){
            try { this.info.paths[i] = this.info.paths[i].split('\\').join('/') } catch(err) {}
        }

        for (var i in this.info.paths.icons){
            try { this.info.paths.icons[i] = this.info.paths.icons[i].split('\\').join('/') } catch(err) {}
        }

        /****************/
        
        var sk = this.info

        this.info.utils = new (require(__dirname + '/modules/sk_utils.js'))({sk: sk})
        this.info.timers = (opt.type === 'dapp' ? new (require(__dirname + '/modules/sk_timers.js'))({sk: sk}) : undefined)
        //this.info.stats = new (require(__dirname + '/modules/sk_stats.js'))({sk: sk})

        sk.paths.sk_frontend = sk.paths.superkraft + 'frontend/'


        /****************/

        global.SK_RootEngine = require(__dirname + '/sk_rootEngine.js')
        sk.engine = new (require(__dirname + '/engines/' + opt.type + '/engine.js'))({ sk: this })
        try {
            /*
            //configure native actions if the engine provides any
            var nativeActionsList = (await window.sk_ipc.ipc.request('sk:nativeActions', { func: 'listActions' })).actions
            sk.nativeActions = {}

            var configAction = action => {
                sk.nativeActions[action] = async opt => {
                    return await sk_ipc.ipc.request('sk:nativeActions', { ...{ func: action }, ...opt })
                }
            }

            for (var i in nativeActionsList) configAction(nativeActionsList[i])
            */
        } catch (err) {
        }

        /****************/

        sk.paths.sk_ui = {root: sk.paths.superkraft + 'ui/'}
        sk.paths.sk_ui.backend = sk.paths.sk_ui.root + 'backend/'
        sk.paths.sk_ui.frontend = {
            core: sk.paths.sk_ui.root + 'frontend/core/',
            engine: __dirname + '/engines/' + opt.type + '/frontend/sk_ui/',
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

        
        
        try { await sk.engine.init() } catch(err) {
            console.error(err)
            if (opt.onFail) return opt.onFail()
        }

        
        await sk.engine.loadPosts()
        
        global.SK_RootViewCore = require(__dirname + '/sk_rootViewCore.js')
        global.SK_RootView = require(__dirname + '/engines/' + opt.type + '/rootView.js')
        
       


        if (opt.useComplexity) sk.complexity.init()

        
        sk.actions = await sk.utils.loadActions([__dirname, 'engines', opt.type, 'global_actions'].join('/') + '/')
        sk.utils.captureActions('root', sk.actions)

        sk.globalActions = await sk.utils.loadActions(sk.paths.globalActions)
        

        if (opt.onPreStart) await opt.onPreStart()
        
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

