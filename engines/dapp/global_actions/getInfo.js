module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, view, _v){

        var info = {
            os: this.sk.sysInfo.os,
            arch: this.sk.sysInfo.arch,
            
            actions: Object.keys(view.actions),
            main: view.info.main,
            version: this.sk.engine.app.getVersion(),

            view: {
                minimizable : _v.minimizable,
                maximizable : view.info.maximizable,
                closable    : _v.closable,
                noTitle     : view.info.noTitle
            },

            show: view.info.show
        }

        res.resolve(info)
    }
}