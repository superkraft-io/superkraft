var fs = require('fs')

//project name
//app type: web || dapp


//npm i <dependencies_for_app_type>
//web: express, ejs, jquery
//dapp: electron, ejse, jquery, wscb (wscb should be included in SK, not installed via npm)



var terminal = new (require('./modules/sk_terminal.js'))()


var start = async ()=>{
    var opt = {
        projectRoot: __dirname
    }

    console.log('Target project root: ' + opt.projectRoot)
    
    opt.projectName = await terminal.query('Project name: '),
    opt.appType = await terminal.query('App type (web || dapp): ')
}
    

start()
