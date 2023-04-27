const fs = require('fs')

const express   = require('express')

const http              = require('http')
const https             = require('https')
const fileUpload        = require('express-fileupload')
const cors              = require('cors')
const bodyParser        = require('body-parser')
const cookieParser      = require('cookie-parser')

const helmet      = require('helmet')


module.exports = class SK_WebEngine extends SK_RootEngine {
    constructor(opt){
        super(opt)
    }

    init(){
        return new Promise(async resolve => {
            this.express = express
            this.sk.app = this.express()
            var app = this.sk.app
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
        

            app.use((err, req, res, next) => {
                // This check makes sure this is a JSON parsing issue, but it might be
                // coming from any middleware, not just body-parser:
            
                if (err instanceof SyntaxError && err.status === 400 && 'body' in err){
                    console.error({error: 'invalid_body'})
                    return res.status(400).send({error: 'invalid_body'}) // Bad request
                }
            
                next()
            })

              
            var csp = {defaultSrc: ["'self'"]}
            for (var _i in this.sk.csp) csp[_i] = ["'self'", ...this.sk.csp[_i]]

            //The following two policies will mess up social sign ins like Google and Facebook
            //app.use(helmet.crossOriginEmbedderPolicy())
            //app.use(helmet.crossOriginOpenerPolicy())
            
            app.use(helmet.contentSecurityPolicy({ directives: csp }))
            

            app.set('view-engine', 'ejs')


            /*********************/

            this.paths = {
                frontend: {
                    sk: this.sk.paths.sk_frontend,
                    ui: {
                        core   : this.sk.ui.paths.frontend.core,
                        shared : this.sk.ui.paths.frontend.shared,
                        view   : this.sk.ui.paths.frontend.view,
                        global : this.sk.ui.paths.frontend.global,
                        font   : this.sk.ui.paths.frontend.font
                    },
                    app: this.sk.paths.app_frontend,
                }
            }

            

            app.use('/sk', this.express.static(this.paths.frontend.sk))
            
            app.use('/', this.express.static(this.paths.frontend.app.split('\\').join('/')))
       
            
            if (this.sk.cdn && this.sk.cdn.servePath) this.sk.app.use(this.sk.cdn.route, this.express.static(this.sk.cdn.servePath))

            this.sk.app.use(this.sk.ui.routes.core, this.express.static(this.paths.frontend.ui.core))
            this.sk.app.use(this.sk.ui.routes.shared, this.express.static(this.paths.frontend.ui.shared))

            if (this.sk.ui.routes.font) this.sk.app.use(this.sk.ui.routes.font, this.express.static(this.paths.frontend.ui.font))


            if (this.sk.complexity) app.use('/complexity', this.express.static(this.sk.complexity.paths.frontend))

            
            /*********************/

            var postsFolder = this.sk.skModule.opt.postsRoot
            
            this.posts = {}

            var posts = fs.readdirSync(postsFolder)
            posts.forEach(_filename => {
                var split = _filename.split('.')
                var ext = split[split.length - 1]
                if (ext !== 'js') return
                
                if (fs.lstatSync(postsFolder + _filename).isDirectory() === true) return

                var postName = _filename.split('.')[0]
                try {
                    var postModule = new (require(postsFolder + _filename))({sk: this.sk})

                    this.posts[postName] = postModule
                    
                    this.sk.app.post('/' + postModule.info.route, async (req, res)=>{
                        var _sw = this.sk.stats.increment({type: 'post', route: postModule.info.route})
                
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
                            var isAuthTokenValid = await this.sk.engine.isAuthTokenValid(auth_token)
                            if (isAuthTokenValid === 'invalid_token') return reject('invalid_token')
                            if (!isAuthTokenValid) return reject('access_denied')
                        }

                        try {
                            var json = JSON.parse(req.body.data)
                            req.body.data = json
                        } catch(err) {

                        }
                        
                        postModule.exec(req, res)

                        _sw.end()
                    })
                } catch(err) {
                    console.error(err)
                }
            })



            this.mobile = new (require('./modules/sk_wapp_mobile.js'))({
                sk: this.sk,
                express: this.express,
                xapp: app,
                mopts: this.sk.mobile
            })
            await this.mobile.init()


            resolve()
        })
    }

    waitForReady(){ return new Promise(resolve => { resolve() }) }

    on(cmd, cb){
        var actionRoute = '/' + cmd
        this.sk.app.post(actionRoute, (req, res) => {
            var _sw = this.sk.stats.increment({type: 'post', route: actionRoute})
                
            cb(
                req.body,
                response => {
                    res.send(response)
                    _sw.end()
                },
                {req: req, res: res}
            )

            
            
        })
    }

    start(){
        return new Promise((resolve, reject)=>{
            var config = this.sk.config

            var ports = {
                http: this.sk.ports.http || config.webserver.ports.http,
                https: this.sk.ports.https || config.webserver.ports.https
            }

            if (config.isWhat.env === 'dev'){
                this.servers = {http: http.createServer(this.app).listen(ports.http)}
                this.servers.http.on('error', err => {
                    console.log('Failed listening to port ' + ports.http)
                    reject()
                })
                resolve()
            } else {

                var certOpt = undefined

                try {
                    var certOpt = {}
                    console.log('Setting up HTTPS certificate...')

                    if (config.cert.ca){
                        try {
                            certOpt.ca = fs.readFileSync(config.cert.ca)
                            console.log('ca bundle loaded...')
                        } catch(err) {
                            console.error('ca bundle failed')
                        }
                    }

                    if (config.cert.cert){
                        try {
                            certOpt.cert = fs.readFileSync(config.cert.cert)
                            console.log('cert loaded...')
                        } catch(err) {
                            console.error('cert failed')
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

                    if (config.cert.p7b){
                        try {
                            certOpt.p7b = fs.readFileSync(config.cert.p7b)
                            console.log('p7b loaded...')
                        } catch(err) {
                            console.error('p7b failed')
                        }
                    }

                } catch(err) {
                    console.error('HTTPS certificates failed')
                    console.error(err)
                }

                this.servers = {}
                
                

                this.servers.https = https.createServer(certOpt, this.app)
                this.servers.https.on('error', err => {
                    console.log('Failed listening to port ' + ports.http)
                    reject()
                })

                this.servers.https.listen(ports.http, function() {
                    console.log("[WAPP ENGINE] Listening on " + ports.http)
                    resolve()
                })
    
                this.servers.http = http.createServer(
                    function (req, res) {
                        try {
                            res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(ports.http, ports.https) + req.url })
                            res.end()
                        } catch(e) {
                            console.error('Invalid request: ' + req.url + '      ' + JSON.stringify(req.headers))
                        }
                    }
                )
                this.servers.http.on('error', err => {
                    console.log('Failed listening to port ' + ports.http)
                    reject()
                })
                
                this.servers.http.listen(ports.http)
            }
        })
    }

    

    isAuthTokenValid(authToken, returnAuthRes){
        return new Promise(async resolve => {
            var validationRes = false
            try {
                var authRes = await this.sk.database.do.authenticate(authToken)
                if (!authRes.error) validationRes = true
                if (authRes.error === 'invalid_token') validationRes = 'invalid_token'
            } catch(err) {
                validationRes = 'invalid_token'
            }

            resolve((returnAuthRes ? authRes : validationRes))
        })
    }

    onValidateAction(srcOpt, view){
        return new Promise(async resolve => {
            if (view.info.bypassOnAuthFail || !view.info.checkAuth) resolve(true)
            
            var auth_token = srcOpt.req.cookies.auth_token
            if (view.info.checkAuth){
                if (!auth_token) return resolve(false)

                var validationRes = await this.sk.engine.isAuthTokenValid(auth_token, true)
                if (!validationRes) return resolve(false)

                resolve(validationRes)
            }
        })
    }
}