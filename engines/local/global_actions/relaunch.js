module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, window){
        global.ss.app.relaunch()
        global.ss.app.exit()
        res.resolve({})
    }
}