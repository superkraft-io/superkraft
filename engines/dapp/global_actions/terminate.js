module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, window){
        global.sk.engine.terminate()
        res.resolve({})
    }
}