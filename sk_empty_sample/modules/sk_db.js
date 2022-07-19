module.exports = class SK_Auth {
    constructor(){
        this.do = new SK_DB_Calls()
    }
}

class SK_DB_Calls {
    constructor(){
    }

    getUserInfo(){
        return new Promise(resolve => {
            resolve({})
        })
    }
}