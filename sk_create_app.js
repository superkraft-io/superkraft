//WIP


var fs = require('fs')

//project name
//app type: web || dapp


//npm i <dependencies_for_app_type>
//web: express, ejs, jquery
//dapp: electron, ejse, jquery, wscb (wscb should be included in SK, not installed via npm)



var terminal = new (require('./modules/sk_terminal.js'))()


var start = async ()=>{
    var sk_root = __dirname.split('\\').join('/')
    var sk_rootParentPath = sk_root.split('/')
    sk_rootParentPath.splice(sk_rootParentPath.length - 1, 1)
    sk_rootParentPath = sk_rootParentPath.join('/') + '/'

    var opt = {
        paths: {
            emptySample: __dirname + '/sk_empty_sample/',
            projectRoot: sk_rootParentPath
        }
    }

    console.log('Target project root: ' + opt.projectRoot)
    
    opt.projectName = await terminal.query('Project name (Use capital letters for acronym. E.g: MySuperKraftApp = MSKA): ')

    opt.projectAcronym = opt.projectName.match(/\p{Lu}/gu).join('').toLowerCase()
    console.log('Project acronym: ' + opt.projectAcronym)

    opt.appType = await terminal.query('App type (web || dapp): ')

    console.log('Creating app...')

    fs.cp(opt.paths.emptySample, opt.paths.projectRoot + opt.projectAcronym + '_' + 'root')
}
    

start()
