module.exports = class SK_RootView extends SK_RootViewCore {
    constructor(opt){
        super(opt)
    }
    
    init(opt){
        return new Promise(async resolve => {
            this.route = opt.route

            this.routes = {
                frontend: {
                    view: this.info.route + 'vfe_frontend/',

                    sk: (this.sk.cdn ? this.sk.cdn.route + 'sk_cdn/sk_frontend' : '/sk'),

                    ui: this.sk.ui.routes.core,
                    ui_shared: 'sk_ui_shared/',
                    ui_global: 'sk_ui_global/',

                    

                    app_root: (this.sk.cdn ? this.sk.cdn.route + 'sk_cdn/app_frontend/' : '/'),
                    app: (this.sk.cdn ? this.sk.cdn.route + 'sk_cdn/app_frontend/' : '/'),
                    global: (this.sk.cdn ? this.sk.cdn.route + 'sk_cdn/app_global/' : '/global'),

                    complexity: '/complexity/',

                    favIcon: this.sk.paths.icons.favIcon
                }
            }


           
            if (this.sk.mobile) this.routes.frontend.mobile = this.sk.engine.mobile.viewInfo
            
            if (this.sk.complexity) this.routes.frontend.complexity = '/complexity/'


           

            await this._init(opt)


            if (this.sk.cdn) this.routes.frontend.ui_cdn = this.sk.cdn.route + 'sk_cdn'

            
            var render = async (res, page, userData, country) => {
                if (this.sk.cdn) this.routes.frontend.view = this.sk.cdn.route + 'sk_cdn/views/' + this.id + '/'
                

                var globalData = this.sk.globalData
                if (this.sk.dynamicGlobalData) globalData = {...globalData, ...this.sk.dynamicGlobalData()}

                var countries = await this.sk.l10n.listCountries()
                var phrases = await this.sk.l10n.getForCountry(country)

                res.render(
                    page,
                    {
                        ...{
                            l10n: {
                                countries: countries,
                                phrases: phrases
                            }
                        },

                        ...this.viewInfo,
                        ...{
                            userData: userData,
                            globalData: globalData,
                        }
                    }
                )
            }
           
            this.sk.app.use(this.routes.frontend.view, this.sk.engine.express.static(opt.root + 'frontend/'))
            this.sk.app.use(this.routes.frontend.global, this.sk.engine.express.static(this.sk.paths.globalFrontend))
        

            if (this.info.vanilla){
                this.sk.app.use('/vanillaFE', this.sk.engine.express.static(this.sk.paths.vanillaFrontend))
                this.routes.frontend.view = {}
            }

            this.sk.app.get(this.info.route, async (req, res)=>{
                this.sk.stats.increment({type: 'get', route: this.info.route})
                
                var auth_token = req.cookies.auth_token

                if (this.onValidate){
                    var validationRes = await this.onValidate(auth_token, req)
                    if (!validationRes) return res.redirect('/404')
                    if (validationRes.redirect) return res.redirect(validationRes.redirect)
                }

                var doCheckAuth = true
                if (this.onPreAuth) try { await this.onPreAuth({req: req, res: res, validationRes: validationRes}) } catch(err) { doCheckAuth = false }
                
                if (this.info.checkAuth && doCheckAuth){
                    if (!auth_token){
                        if (this.info.onAuthFail) return res.redirect(this.info.onAuthFail)
                        if (!this.info.bypassOnAuthFail) return res.redirect('/404')
                    } else {
                        var auth_res = await this.sk.engine.isAuthTokenValid(auth_token, true)
                    
                        if (auth_res){
                            if (auth_res.error === 'invalid_token'){
                                return res.redirect('/logout')
                            }


                            //check ban
                            var latestRestrictionRes = await this.sk.database.do.getLatestRestriction({user_id: auth_res.userID})
                            if (latestRestrictionRes.latestRestriction){
                                if (this.info.route !== '/restricted') return res.redirect('/restricted')
                            } else {
                                if (this.info.onRestrictionsOk) return res.redirect(this.info.onRestrictionsOk)
                            }

                            //check if needs redirect
                            if (this.info.onAuthOk) return res.redirect(this.info.onAuthOk)
                            
                            //check if activated
                            /*
                            try {
                                var isAccActivated = (
                                    this.onCheckAccActivation ?
                                    await this.onCheckAccActivation(auth_token)
                                    :
                                    (await this.sk.database.do.isAccActivated(auth_token)).accActivated
                                )
                                
                                if (isAccActivated){
                                    if (this.info.onAccActivated) return res.redirect(this.info.onAccActivated)
                                } else {
                                    if (this.info.onAccNotActivated) return res.redirect(this.info.onAccNotActivated)
                                }
                            } catch(err) {
                                return res.redirect(this.info.onAccNotActivated)
                            }
                            */
                            
                        } else {
                            if (this.info.onAuthFail){
                                return res.redirect(this.info.onAuthFail)
                            } else {
                                if (!this.info.bypassOnAuthFail) return res.redirect('/404')
                            }
                        }
                    }
                }


                

                var userData = undefined
                if (this.onForwardUserData){
                    try {
                        userData = await this.onForwardUserData(auth_token, validationRes, {req: req, res: res})
                    } catch(err) {
                        return res.redirect('/404')
                    }
                }
               
                
                
                var lang = 'en'
                try {
                    lang = req.cookies.country || req.headers['accept-language'].split(',')[0].split('-')[0]
                } catch(err) {
                    lang = 'en'
                }

                var ejsPath = this.sk.paths.superkraft + '/template.ejs'
                if (this.info.vanilla){
                    ejsPath = this.root + 'frontend/view.ejs'
                }
                render(res, ejsPath, userData, lang)
            })
        

            resolve()
        })
    }
}