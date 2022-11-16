module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, view, _v){

        var info = {
            os: global.sk.sysInfo.os,
            arch: global.sk.sysInfo.arch,
            
            actions: Object.keys(view.actions),
            main: view.info.main,
            version: global.sk.app.getVersion(),

            view: {
                minimizable : _v.minimizable,
                maximizable : _v.maximizable,
                closable    : _v.closable,
                noTitle     : view.info.noTitle
            }
        }

        res.resolve(info)
    }
}