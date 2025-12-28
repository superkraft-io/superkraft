module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, window){
        this.sk.engine.app.relaunch()
        this.sk.engine.terminate()
        res.resolve({})
    }
}