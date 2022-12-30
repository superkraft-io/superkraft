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

                    complexity: '/complexity/',

                    favIcon: global.sk.paths.icons.favIcon
                }
            }

            if (global.sk.mobile) this.routes.frontend.mobile = global.sk.engine.mobile.viewInfo
            
            if (global.sk.complexity) this.routes.frontend.complexity = '/complexity/'


           

            await this._init(opt)

            var render = async (res, page, userData, country) => {
                var globalData = sk.globalData
                if (sk.dynamicGlobalData) globalData = {...globalData, ...sk.dynamicGlobalData()}

                res.render(
                    page,
                    {
                        ...{
                            l10n: {
                                countries: await sk.l10n.listCountries(),
                                phrases: await sk.l10n.getForCountry(country)
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
           
            global.sk.app.use(this.routes.frontend.view, global.sk.engine.express.static(opt.root + 'frontend/'))
            global.sk.app.use(this.routes.frontend.global, global.sk.engine.express.static(global.sk.paths.globalFrontend))
        

            if (this.info.vanilla) global.sk.app.use('/vanillaFE', global.sk.engine.express.static(global.sk.paths.vanillaFrontend))

            global.sk.app.get(this.info.route, async (req, res)=>{
                global.sk.stats.increment({type: 'get', route: this.info.route})
                
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
                        var auth_res = await global.sk.engine.isAuthTokenValid(auth_token, true)
                    
                        if (auth_res){
                            if (auth_res.error === 'invalid_token'){
                                return res.redirect('/logout')
                            }


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
                            try {
                                var isAccActivated = (await global.sk.database.do.isAccActivated(auth_token)).accActivated
                                if (isAccActivated){
                                    if (this.info.onAccActivated) return res.redirect(this.info.onAccActivated)
                                } else {
                                    if (this.info.onAccNotActivated) return res.redirect(this.info.onAccNotActivated)
                                }
                            } catch(err) {
                                return res.redirect(this.info.onAccNotActivated)
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
               
                
                
                var lang = 'en'
                try {
                    lang = req.cookies.country || req.headers['accept-language'].split(',')[0].split('-')[0]
                } catch(err) {
                    lang = 'en'
                }

                var ejsPath = global.sk.paths.superkraft + '/template.ejs'
                if (this.info.vanilla){
                    ejsPath = this.root + 'frontend/view.ejs'
                }
                render(res, ejsPath, userData, lang)
            })
        

            resolve()
        })
    }
}