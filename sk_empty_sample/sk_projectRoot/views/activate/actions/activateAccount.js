module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v, srcOpt){

        var authRes = await global.sai.database.do.authenticate(srcOpt.req.cookies.auth_token)
        var userInfo = (await global.sai.database.do.getUserByID(authRes.userID)).user

        var dbRes = await global.sai.database.do.getUserByID(userInfo.id)
        var user = dbRes.user

        var success = false
        if (user.activation_code === opt.activationCode) {
            global.sai.database.do.log.user(null, userInfo.id, 'activate', 0)
            global.sai.database.do.activateUser(userInfo.id)
            success = true
        } else {
            global.sai.database.do.log.user(null, userInfo.id, 'activate', 1)
            success = false
        }

        res.resolve({status: success})
    }
}