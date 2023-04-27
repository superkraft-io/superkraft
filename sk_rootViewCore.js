var fs = require('fs')

module.exports = class sk_RootViewCore {
    constructor(opt){
        this.sk = opt.sk
    }

    _init(opt){
        return new Promise(resolve => {
            this.actions = {}
            this.id = opt.id

            this.viewInfo = {
                app_type: this.sk.type,
    
                id: this.id,
                title: (this.info ? this.info.title : 'New View'),
                sk: {
                    ui: this.sk.ui.renderInfo(opt.root + 'frontend/sk_ui/'),
                    routes: this.routes
                },

                globalHead: this.sk.paths.templates + 'head.ejs',
                viewHead: opt.root + 'head.ejs',
                viewBodyScripts: {
                    start: opt.root + 'body_start.ejs',
                    end: opt.root + 'body_end.ejs'
                }
            }

            if (this.sk.type === 'dapp') this.viewInfo.views = this.sk.viewList


            if (!fs.existsSync(this.viewInfo.globalHead             )) this.viewInfo.globalHead            = this.sk.paths.superkraft + 'sk_emptyEJS.ejs'
            if (!fs.existsSync(this.viewInfo.viewHead               )) this.viewInfo.viewHead              = this.sk.paths.superkraft + 'sk_emptyEJS.ejs'
            if (!fs.existsSync(this.viewInfo.viewBodyScripts.start  )) this.viewInfo.viewBodyScripts.start = this.sk.paths.superkraft + 'sk_emptyEJS.ejs'
            if (!fs.existsSync(this.viewInfo.viewBodyScripts.end    )) this.viewInfo.viewBodyScripts.end   = this.sk.paths.superkraft + 'sk_emptyEJS.ejs'

            if (this.sk.complexity) this.viewInfo.sk.useComplexity = this.sk.useComplexity
            
            //load actions
            this.actions = this.sk.utils.loadActions(opt.root + 'actions/')
            try { this.actions = {...this.actions, ...this.sk.globalActions } } catch(err) {}
            this.sk.utils.captureActions(
                this.id,
                this.actions,
                this.sk.engine.onValidateAction
            )

            var actionsList = []
            for (var action in this.actions) actionsList.push(action)

            resolve(this.viewInfo)
        })
    }
}