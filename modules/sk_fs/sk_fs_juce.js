
module.exports = class SK_FS_JUCE {
    constructor(opt){
        this.sk = opt.sk
        this.promises = require('fs').promises

        window.fs = this
    }
    
    async init(){
       
    }
}