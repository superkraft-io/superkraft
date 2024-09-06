module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v){

        var info = {
            os: this.sk.ums.broadcast,
            arch: this.sk.sysInfo.arch,
            
            actions: Object.keys(view.actions),
            nativeActions: (await window.sk_ipc.ipc.request('sk:nativeActions', { func: 'listActions' })).actions,
            main: view.info.main,
            version: this.sk.app.getVersion(),

            view: {
                minimizable : _v.minimizable,
                maximizable : _v.maximizable,
                closable    : _v.closable,
                noTitle     : view.info.noTitle
            },

            show: view.info.show
        }

        res.resolve(info)
    }
}