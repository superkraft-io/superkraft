module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v){
        
        var info = {
            os: this.sk.sysInfo.os,
            arch: this.sk.sysInfo.arch,
            
            actions: Object.keys(view.actions),
            //nativeActions: (await sk_api.ipc.request('sk.nativeActions', { func: 'listActions' })).actions,
            main: _v.main,
            version: this.sk.app.getVersion(),

            view: {
                minimizable : _v.minimizable,
                maximizable : _v.maximizable,
                closable    : _v.closable,
                noTitle     : _v.noTitle
            },

            show: _v.show
        }

        res.resolve(info)
    }
}