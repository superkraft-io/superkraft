module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, view, _v){
        var info = {
            os: '',
            actions: Object.keys(view.actions),
            main: false,

            // In-page windows (sk_ui_titlebar) drop their close button unless closable is set.
            view: {
                closable: true
            }
        }

        res.resolve(info)
    }
}