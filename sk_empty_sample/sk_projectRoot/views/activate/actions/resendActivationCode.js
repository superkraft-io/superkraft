module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v, srcOpt){
        console.log('sending new activation code')
        

        var authRes = await global.sai.database.do.authenticate(srcOpt.req.cookies.auth_token)
        var userInfo = (await global.sai.database.do.getUserByID(authRes.userID)).user

        await global.sai.database.do.regenerateActivationCode(userInfo.id)
        global.sai.database.do.log.user(null, userInfo.id, 'resend account activation code', 0)
        global.sai.auth.sendActivationCode(userInfo.email, userInfo.activation_code)

        res.resolve({})
    }
}