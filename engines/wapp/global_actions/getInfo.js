module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, view, _v){
        var info = {
            os: '',
            actions: Object.keys(view.actions),
            main: false,

            view: {}
        }

        res.resolve(info)
    }
}