module.exports = class SK_View extends SK_RootView {
    constructor(){
        super()

        this.info = {
            mainRedirect: 'path to this view main.js in a different location',
        }
        
        //or
        
        this.info = {
            route: '/',
            //priority: 1, //defines in what order this view should load
            //checkAuth: true,
            //bypassOnAuthFail: true, //bypass auth redirect if it fails. mainly used to its own route if authentication fails
            //onAuthOk: '/dashboard', //redirect to this route if auth OK and user account activation OK
            //onAuthFail: '/login', //redirect to this route if auth fails
            //onAccNotActivated: '/activate', //redirect to this route if account is not activated
        }
    }

    onForwardUserData(auth_token){
        return new Promise(async resolve => {
            //arg "auth_token" is used to identify the user

            resolve({
                someData: {
                    toBe: 'passed to the client', //in the frontend, this data is accessed via "sk.userData..."
                }
            })
        })
    }


    onValidate(auth_token, req){
        return new Promise(async resolve => {
            //this function is used to validate a GET request mainly by its URL query,
            //such as unique ticket URLs. Example: mysite.com/?ticketID=1234

            var res = await validateSomehow(req.query.ticketID) //validate the ticket
            if (!res) return resolve(false) //ticket is invalid. reject!

            res.ticketID = req.query.uuid //store ticket ID in the ticket object

            //ticket ID is valid. respond

            resolve(res)
        })
    }
}