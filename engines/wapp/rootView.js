module.exports = class SK_RootView extends SK_RootViewCore {
    init(opt){
        return new Promise(async resolve => {
            this.route = opt.route

            this.routes = {
                frontend: {
                    view: this.info.route + 'vfe_frontend/',

                    sk: '/sk/',

                    ui: global.sk.ui.routes.core,
                    ui_shared: 'sk_ui_shared/',
                    ui_global: 'sk_ui_global/',

                    app_root: '',
                    app: '',
                    global: '/global',

                    complexity: '/complexity/'
                }
            }
            
            if (global.sk.complexity) this.routes.frontend.complexity = '/complexity/'

            await this._init(opt)

            var render = (res, page, userData, country) => {
                res.render(
                    page,
                    {
                        ...{
                            l10n: {
                                countries: sk.l10n.listCountries(),
                                phrases: sk.l10n.getForCountry(country)
                            }
                        },

                        ...this.viewInfo,
                        ...{userData: userData}
                    }
                )
            }
           
            global.sk.app.use(this.routes.frontend.view, global.sk.engine.express.static(opt.root + 'frontend/'))
            global.sk.app.use(this.routes.frontend.global, global.sk.engine.express.static(global.sk.paths.globalFrontend))
        
            global.sk.app.get(this.info.route, async (req, res)=>{
                var auth_token = req.cookies.auth_token

                if (this.onValidate){
                    var validationRes = await this.onValidate(auth_token, req)
                    if (!validationRes) return res.redirect('/404')
                    if (validationRes.redirect) return res.redirect(validationRes.redirect)
                }

                if (this.info.checkAuth){
                    if (!auth_token){
                        if (this.info.onAuthFail) return res.redirect(this.info.onAuthFail)
                        if (!this.info.bypassOnAuthFail) return res.redirect('/404')
                    } else {
                        var auth_res = await global.sk.engine.isAuthTokenValid(auth_token, true)
                    
                        if (auth_res){
                            //check ban
                            var latestRestrictionRes = await global.sk.database.do.getLatestRestriction({user_id: auth_res.userID})
                            if (latestRestrictionRes.latestRestriction){
                                if (this.info.route !== '/restricted') return res.redirect('/restricted')
                            } else {
                                if (this.info.onRestrictionsOk) return res.redirect(this.info.onRestrictionsOk)
                            }

                            //check if needs redirect
                            if (this.info.onAuthOk) return res.redirect(this.info.onAuthOk)
                            
                            //check if activated
                            var isAccActivated = (await global.sk.database.do.isAccActivated(auth_token)).accActivated
                            if (isAccActivated){
                                if (this.info.onAccActivated) return res.redirect(this.info.onAccActivated)
                            } else {
                                if (this.info.onAccNotActivated) return res.redirect(this.info.onAccNotActivated)
                            }
                            
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
               
                
                
                render(res, global.sk.paths.superkraft + '/template.ejs', userData, req.cookies.country)
            })
        

            resolve()
        })
    }
}