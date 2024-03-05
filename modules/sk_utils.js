module.exports = class SK_Window {
    constructor(opt){
        this.sk = opt.sk
    }

    async loadActions(srcPath){
        try {
            var actionsPath = srcPath
            var actionsFiles = await sk_fs.promises.readdir(actionsPath)
            var actions = {}
            for (var i = 0; i < actionsFiles.length; i++){
                var actionName = actionsFiles[i].split('.')[0]
                var action = new (require(actionsPath + actionName + '.js'))({sk: this.sk, window: this.window})
                action.id = actionName
                actions[actionName] = action
            }

            return actions
        } catch(err) {
            //console.error(err)
            console.error('Could not load actions at ' + srcPath)
        }

        return {}
    }

    captureActions(route, actions, onValidate){
        this.sk.engine.on(`action_${route}`, async (msg, rW, srcOpt) => {
            var action = actions[msg.action]
            
            var _sw = this.sk.stats.increment({type: 'action', route: msg.action})

            var view = this.sk.views[msg.vid]

            if (route !== 'root' && this.sk.type === 'dapp') if (view.id !== msg.vid) return

            var res = {}

            var reject = msg => {
                res.rejected = true
                res.error = msg
                rW(res)
                return
            }

            var validationRes = undefined
            if (onValidate){
                validationRes = await onValidate(srcOpt, view)
                if (!validationRes) return reject('access_denied')
            }


            try {
                res = await action.run(view, msg.data, srcOpt, validationRes)
            } catch(err) {
                console.error(err)
                return reject(err)
            }
        
            
            _sw.end()
            
            rW(res)
        })
    }

}