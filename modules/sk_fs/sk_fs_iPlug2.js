
module.exports = class SK_FS_iPlug2 {
    constructor(opt){
        this.sk = opt.sk
        this.promises = require('fs').promises

        window.fs = this
    }
    
    async init(){
       
    }
}