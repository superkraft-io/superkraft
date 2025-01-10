module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, view, _v){
        this.sk.online = opt.online
        if (this.sk.onOnlineChanged) this.sk.onOnlineChanged()
        res.resolve({})
    }
}