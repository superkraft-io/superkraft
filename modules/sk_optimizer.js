var fs = require('fs-extra')

module.exports = class SK_Optimizer {
    constructor(view){
        global.sk.paths.cache = global.sk.paths.root + 'sk_cache/'
    }


    createOptimizeFolder(){
        fs.mkdirSync(global.sk.paths.cache)
    }

    optimize(){
        
    }

    optimizeCoreUI(){
        //iterate SK core UI components
    }

    optimizeViews(){
        //iterate views
    }

    optimizeView(view){
        //iterate view UI components
    }

}