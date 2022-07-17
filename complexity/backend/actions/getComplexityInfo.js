module.exports = class SS_Action extends SS_RootAction {
    exec(opt, res, view, _v){
        var views = {}
        for (var _v in global.sk.views){
            var view = global.sk.views[_v]
            views[view.id] = {route: view.info.route}
        }

        res.resolve({
            actions: Object.keys(global.sk.complexity.actions),
            views: views,
        })
    }
}