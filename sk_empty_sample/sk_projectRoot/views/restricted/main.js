module.exports = class SK_View extends SK_RootView {
    constructor(){
        super()

        this.info = {
            route: '/restricted',
            checkAuth: true,
            onRestrictionsOk: '/dashboard'
        }
    }

    onForwardUserData(auth_token){
        return new Promise(async resolve => {
            var authRes = await database.do.authenticate(auth_token)
            var latestRestrictionRes = await database.do.getLatestRestriction({user_id: authRes.userID})

            resolve({
                date: latestRestrictionRes.latestRestriction.date,
                message: latestRestrictionRes.latestRestriction.message,
                duration: latestRestrictionRes.latestRestriction.duration
            })
        })
    }
}