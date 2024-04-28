var __fs = undefined


module.exports = class SK_FS_Simple {
    constructor(opt){
        var fsTypes = {
            wapp: this.SK_FS_Promises_Standard(),
            dapp: this.SK_FS_Promises_Standard(),
        }

        try { this.promises = new fsTypes[opt.app_type](this) } catch(err) {}

        window.fs = this
    }
    
    async init(){
        if (this.promises.init) this.promises.init()
    }


    SK_FS_Promises_Standard(){
        this.promises = require('fs/promises')
    }
}