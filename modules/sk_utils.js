var fs = require('fs')

module.exports = class SK_Window {
    constructor(opt){
    }

    loadActions(srcPath){
        var actionsPath = srcPath
        var actionsFiles = fs.readdirSync(actionsPath)
        var actions = {}
        for (var i = 0; i < actionsFiles.length; i++){
            var actionName = actionsFiles[i].split('.')[0]
            var action = new (require(actionsPath + actionName + '.js'))(this.window)
            actions[actionName] = action
        }

        return actions
    }

    captureActions(route, actions, onValidate){
        global.ss.engine.on(`action_${route}`, async (msg, rW, srcOpt) => {
            var action = actions[msg.action]
            var view = global.ss.views[msg.vid]

            if (route !== 'root' && global.ss.type === 'dapp') if (view._view.id !== msg.senderID ) return

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
        
            rW(res)
        })
    }

}