const fs = require('fs')

const express   = require('express')

const http              = require('http')
const https             = require('https')
const fileUpload        = require('express-fileupload')
const cors              = require('cors')
const bodyParser        = require('body-parser')
const cookieParser      = require("cookie-parser")

const helmet      = require("helmet")


module.exports = class SK_WebEngine extends SK_RootEngine {
    constructor(opt){
        super()
        

        this.express = express
        global.sk.app = this.express()
        var app = global.sk.app
        this.app = app
        
        app.get(this.express.json())
        
        app.use(fileUpload({
            createParentPath: true
        }))

        app.use(cookieParser())

        app.use(cors({
            origin: '*'
        }))
        
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))
    

        var csp = {defaultSrc: ["'self'"]}
        for (var _i in global.sk.csp) csp[_i] = ["'self'", ...global.sk.csp[_i]]
        app.use(helmet.contentSecurityPolicy({ directives: csp }))

        
        app.set('view-engine', 'ejs')


        /*********************/

        this.paths = {
            frontend: {
                sk: global.sk.paths.sk_frontend,
                ui: {
                    core   : global.sk.ui.paths.frontend.core,
                    shared : global.sk.ui.paths.frontend.shared,
                    view   : global.sk.ui.paths.frontend.view,
                    global : global.sk.ui.paths.frontend.global
                },
                app: global.sk.paths.app_frontend,
            }
        }

        

        app.use('/sk', this.express.static(this.paths.frontend.sk))
        
        app.use('/', this.express.static(this.paths.frontend.app.split('\\').join('/')))

        if (global.sk.complexity) app.use('/complexity', this.express.static(global.sk.complexity.paths.frontend))
        
        global.sk.app.use(global.sk.ui.routes.core, this.express.static(this.paths.frontend.ui.core))
        global.sk.app.use(global.sk.ui.routes.shared, this.express.static(this.paths.frontend.ui.shared))


        /*********************/

        var postsFolder = global.sk.skModule.opt.postsRoot
        
        this.posts = {}

        var posts = fs.readdirSync(postsFolder)
        posts.forEach(_filename => {
            if (_filename.toLocaleLowerCase().indexOf('.ds_store') > -1) return
            
            var postName = _filename.split('.')[0]
                try {
                var postModule = new (require(postsFolder + _filename))()

                this.posts[postName] = postModule
                
                global.sk.app.post('/' + postModule.info.route, async (req, res)=>{
                    var _res = {}
                    var reject = msg => {
                        _res.rejected = true
                        _res.error = msg
                        res.send(_res)
                        return
                    }

                    if (postModule.info.protected){
                        var auth_token = req.cookies.auth_token
                        if (!auth_token) return reject('access_denied')
                        var isAuthTokenValid = await global.sk.engine.isAuthTokenValid(auth_token)
                        if (!isAuthTokenValid) return reject('access_denied')
                    }

                    try {
                        var json = JSON.parse(req.body.data)
                        req.body.data = json
                    } catch(err) {

                    }
                    
                    postModule.exec(req, res)
                })
            } catch(err) {
                console.error(err)
            }
        })
    }

    waitForReady(){ return new Promise(resolve => { resolve() }) }

    on(cmd, cb){
        var actionRoute = '/' + cmd
        global.sk.app.post(actionRoute, (req, res) => {
            cb(
                req.body,
                response => { res.send(response) },
                {req: req, res: res}
            )
        })
    }

    start(){
        return new Promise((resolve, reject)=>{
            var config = global.sk.config
            if (config.isWhat.env === 'dev'){
                http.createServer(this.app).listen(config.webserver.ports.http)
                resolve()
            } else {

                var certOpt = undefined

                try {
                    var certOpt = {}
                    console.log('Setting up HTTPS certificate...')

                    if (config.cert.ca_bundle){
                        try {
                            certOpt.ca_bundle = fs.readFileSync(config.cert.ca_bundle)
                            console.log('ca_bundle loaded...')
                        } catch(err) {
                            console.error('ca_bundle failed')
                        }
                    }

                    if (config.cert.crt){
                        try {
                            certOpt.cert = fs.readFileSync(config.cert.cert)
                            console.log('crt loaded...')
                        } catch(err) {
                            console.error('crt failed')
                        }
                    }

                    if (config.cert.key){
                        try {
                            certOpt.key = fs.readFileSync(config.cert.key)
                            console.log('key loaded...')
                        } catch(err) {
                            console.error('key failed')
                        }
                    }

                } catch(err) {
                    console.error('HTTPS certificates failed')
                    console.error(err)
                }

                https.createServer(certOpt, this.app)
                .listen(config.webserver.ports.https, function() {
                    console.log("[ENGINE] Listening on " + config.webserver.ports.https)
                    resolve()
                })
    
                http.createServer(
                    function (req, res) {
                        try {
                            res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(80, 443) + req.url })
                            res.end()
                        } catch(e) {
                            console.error('Invalid request: ' + req.url + '      ' + JSON.stringify(req.headers))
                        }
                    }
                ).listen(config.webserver.ports.http)
            }
        })
    }

    

    isAuthTokenValid(authToken, returnAuthRes){
        return new Promise(async resolve => {
            var isValid = false
            try {
                var authRes = await global.sk.database.do.authenticate(authToken)
                isValid = true
            } catch(err) { }

            resolve((returnAuthRes ? authRes : isValid))
        })
    }

    onValidateAction(srcOpt, view){
        return new Promise(async resolve => {
            if (view.info.bypassOnAuthFail || !view.info.checkAuth) resolve(true)
            
            var auth_token = srcOpt.req.cookies.auth_token
            if (view.info.checkAuth){
                if (!auth_token) return resolve(false)

                var validationRes = await global.sk.engine.isAuthTokenValid(auth_token, true)
                if (!validationRes) return resolve(false)

                resolve(validationRes)
            }
        })
    }
}