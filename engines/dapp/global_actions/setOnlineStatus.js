module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, view, _v){
        global.sk.online = opt.online
        if (global.sk.onOnlineChanged) global.sk.onOnlineChanged()
        res.resolve({})
    }
}