var fs = require('fs-extra')
var SS_UI_Component_Bakery = require('../../frontend/codeEditor/bakery.js')

module.exports = class SS_Action extends SS_RootAction {
    exec(opt, res, view, _v){
       
        var errors = []
        for (var i = 0; i < opt.length; i++){
            var pseudoClass = opt[i]
            var baked = (new SS_UI_Component_Bakery(pseudoClass)).asClass()

            var targetPath = global.ss.complexity.paths.bakery + pseudoClass.pseudoClassName + '/'
            try { fs.removeSync(targetPath) } catch(err){ errors.push(err) }    
            try {
                fs.mkdirSync(targetPath)
                fs.writeFileSync(targetPath + pseudoClass.pseudoClassName + '.css', baked.css)
                fs.writeFileSync(targetPath + pseudoClass.pseudoClassName + '.js', baked.js)
            } catch(err){
                errors.push(err)
            }
        }


        res.resolve(errors)
    }
}

