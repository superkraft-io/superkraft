module.exports = class SK_View extends SK_RootView {
    constructor(){
        super()

        this.info = {
            route: '/activate',
            checkAuth: true,
            onAccActivated: '/dashboard'
        }
    }

    onForwardUserData(auth_token){
        return new Promise(async resolve => {
            var authRes = await database.do.authenticate(auth_token)
            var userInfo = (await database.do.getUserByID(authRes.userID)).user

            resolve({email: userInfo.email})
        })
    }
}