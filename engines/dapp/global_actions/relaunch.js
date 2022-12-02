module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, window){
        global.sk.app.relaunch()
        global.sk.engine.terminate()
        res.resolve({})
    }
}