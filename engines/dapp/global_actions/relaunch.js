module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, window){
        this.sk.info.app.relaunch()
        this.sk.info.engine.terminate()
        res.resolve({})
    }
}