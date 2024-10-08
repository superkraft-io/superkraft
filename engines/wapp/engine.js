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

        this.sk.app = express()
    }

    init(){
        return new Promise(async resolve => {
            this.express = express
           
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
            for (var _i in this.sk.info.csp) csp[_i] = ["'self'", ...this.sk.info.csp[_i]]

            //The following two policies will mess up social sign ins like Google and Facebook
            //app.use(helmet.crossOriginEmbedderPolicy())
            //app.use(helmet.crossOriginOpenerPolicy())
            
            app.use(helmet.contentSecurityPolicy({ directives: csp }))
            

            app.set('view-engine', 'ejs')


            /*********************/

            this.paths = {
                frontend: {
                    sk: this.sk.info.paths.sk_frontend,
                    ui: {
                        core   : this.sk.info.ui.paths.frontend.core,
                        shared : this.sk.info.ui.paths.frontend.shared,
                        view   : this.sk.info.ui.paths.frontend.view,
                        global : this.sk.info.ui.paths.frontend.global,
                        font   : this.sk.info.ui.paths.frontend.font
                    },
                    app: this.sk.info.paths.app_frontend,
                }
            }

            

            app.use('/sk', this.express.static(this.paths.frontend.sk))
            
            app.use('/', this.express.static(this.paths.frontend.app.split('\\').join('/')))
       
            
            if (this.sk.cdn && this.sk.cdn.servePath) this.sk.app.use(this.sk.cdn.route, this.express.static(this.sk.cdn.servePath))

            this.sk.app.use(this.sk.info.ui.routes.core, this.express.static(this.paths.frontend.ui.core))
            this.sk.app.use(this.sk.info.ui.routes.shared, this.express.static(this.paths.frontend.ui.shared))

            if (this.sk.info.ui.routes.font) this.sk.app.use(this.info.sk.ui.routes.font, this.express.static(this.paths.frontend.ui.font))


            if (this.sk.complexity) app.use('/complexity', this.express.static(this.sk.complexity.paths.frontend))

            
            /*********************/

            this.mobile = new (require('./modules/sk_wapp_mobile.js'))({
                sk: this.sk,
                express: this.express,
                xapp: app,
                mopts: this.sk.info.mobile
            })
            await this.mobile.init()


            resolve()
        })
    }

    waitForReady(){ return new Promise(resolve => { resolve() }) }

    on(cmd, cb){
        var actionRoute = '/' + cmd
        this.sk.app.post(actionRoute, (req, res) => {
            //var _sw = this.sk.stats.increment({type: 'post', route: actionRoute})
                
            cb(
                req.body,
                response => {
                    res.send(response)
                    //_sw.end()
                },
                {req: req, res: res}
            )

            
            
        })
    }

    start(){
        return new Promise((resolve, reject)=>{
            var config = this.sk.info.config

            var ports = {
                http: this.sk.info.ports.http || config.webserver.ports.http,
                https: this.sk.info.ports.https || config.webserver.ports.https
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
                    console.log('Failed listening to port ' + ports.https)
                    reject()
                })

                this.servers.https.listen(ports.https, function() {
                    console.log("[WAPP ENGINE] Listening on " + ports.https)
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
                    
                })
                
                this.servers.http.listen(ports.http)
            }
        })
    }

    

    isAuthTokenValid(authToken, returnAuthRes){
        return new Promise(async resolve => {
            var validationRes = false
            try {
                var authRes = await this.sk.info.database.do.authenticate(authToken)
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

                var validationRes = await view.sk.info.engine.isAuthTokenValid(auth_token, true)
                if (!validationRes) return resolve(false)

                resolve(validationRes)
            }
        })
    }
}