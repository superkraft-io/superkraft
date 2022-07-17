var fs = require('fs')

module.exports = class sk_RootViewCore {
    _init(opt){
        return new Promise(resolve => {
            this.actions = {}
            this.id = opt.id

            this.viewInfo = {
                app_type: global.sk.type,
    
                id: this.id,
                title: (this.info ? this.info.title : 'New View'),
                sk: {
                    ui: sk.ui.renderInfo(opt.root + 'frontend/sk_ui/'),
                    routes: this.routes
                },

                globalHead: sk.paths.templates + 'head.ejs',
                viewHead: opt.root + 'head.ejs',
                viewBodyScripts: {
                    start: opt.root + 'body_start.ejs',
                    end: opt.root + 'body_end.ejs'
                },
                
            }

            if (!fs.existsSync(this.viewInfo.viewHead               )) this.viewInfo.viewHead              = global.sk.paths.superstructure + 'sk_emptyEJS.ejs'
            if (!fs.existsSync(this.viewInfo.viewBodyScripts.start  )) this.viewInfo.viewBodyScripts.start = global.sk.paths.superstructure + 'sk_emptyEJS.ejs'
            if (!fs.existsSync(this.viewInfo.viewBodyScripts.end    )) this.viewInfo.viewBodyScripts.end   = global.sk.paths.superstructure + 'sk_emptyEJS.ejs'

            if (global.sk.complexity) this.viewInfo.sk.useComplexity = global.sk.useComplexity
            
            //load actions
            this.actions = global.sk.utils.loadActions(opt.root + 'actions/')
            global.sk.utils.captureActions(
                this.id,
                this.actions,
                global.sk.engine.onValidateAction
            )

            var actionsList = []
            for (var action in this.actions) actionsList.push(action)
            

            

            resolve(this.viewInfo)
        })
    }
}