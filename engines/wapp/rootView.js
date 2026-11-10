module.exports = class SK_RootView extends SK_RootViewCore {
    constructor(opt){
        super(opt)
    }
    
    /**
     * Local addresses that generated templates and the app's settings bake in (the mobile web app's manifest,
     * splash images and icons, the app icons in /img/...): on the CDN those files are in the export, under these
     * folders. The exported manifest's start_url and scope point back at the site.
     */
    cdnRewritesFor(siteBase){
        var rules = [['/sk_wapp_mobile/', siteBase + '/sk_wapp_mobile/']]
        // The app's frontend is served from /, so /img/x is its img/x
        try {
            var appDir = this.sk.info.paths.app_frontend
            // Superkraft's own routes come first on the site (/sk_ui/ is the core components, not the app's sk_ui folder)
            var taken = new Set(['/sk/', ...Object.values(this.sk.info.ui.routes || {})])
            for (var e of require('fs').readdirSync(appDir, {withFileTypes: true})) {
                if (e.isDirectory() && !/^(node_modules|\.)/.test(e.name) && !taken.has('/' + e.name + '/')) rules.push(['/' + e.name + '/', siteBase + '/app_frontend/' + e.name + '/'])
            }
        } catch(err) {}
        return rules
    }

    /** The rendered page with those addresses on the CDN: only in the tags that load files, never in links */
    toCdn(html){
        var rules = this.cdnRewrites || []
        if (!rules.length) return html
        return html.replace(/<(link|script|img|source|video|audio)\b[^>]*>/gi, tag => tag.replace(/\b(src|href)=(["'])(\/[^"']*)\2/gi, (m, attr, q, url) => {
            for (var [from, to] of rules) if (url.startsWith(from)) return attr + '=' + q + to + url.slice(from.length) + q
            return m
        }))
    }

    init(opt){
        return new Promise(async resolve => {
            this.route = opt.route

            var cdn = this.sk.info.cdn
            var cdnRoute = cdn.routes[this.sk.info.config.isWhat.env]
            var onCdn = cdn.targets.site === 'public'
            // Where the exported site (sk_cdnExporter) lives on the CDN: cdn.paths.site, e.g. releases/site
            var siteBase = onCdn ? cdnRoute + String((cdn.paths && cdn.paths.site) || 'sk_cdn').replace(/^\/+|\/+$/g, '') : ''

            this.routes = {
                frontend: {
                    view: this.info.route + 'vfe_frontend/',

                    sk: (onCdn ? siteBase + '/sk_frontend' : '/sk'),

                    ui: this.sk.info.ui.routes.core,
                    ui_shared: '/sk_ui_shared/',
                    ui_global: '/sk_ui_global/',

                    

                    app_root: (onCdn ? siteBase + '/app_frontend/' : '/'),
                    app: (onCdn ? siteBase + '/app_frontend/' : '/'),
                    global: (onCdn ? siteBase + '/app_global/' : '/sk_ui_global/'),

                    complexity: '/complexity/',

                    favIcon: this.sk.info.paths.icons.favIcon
                }
            }


           
            if (this.sk.info.mobile) this.routes.frontend.mobile = this.sk.info.engine.mobile.viewInfo
            
            if (this.sk.info.complexity) this.routes.frontend.complexity = '/complexity/'


           

            await this._init(opt)


            if (onCdn) {
                this.routes.frontend.ui_cdn = siteBase
                // The base styles and every core, shared and global component's own files (root_url)
                this.routes.frontend.ui = siteBase + '/sk_ui_core/'
                this.routes.frontend.ui_shared = siteBase + '/sk_ui_shared/'
                this.routes.frontend.ui_global = siteBase + '/app_global/'
                if (this.sk.info.ui.routes.font) this.routes.frontend.font = siteBase + '/sk_ui_font/'
                var fav = this.routes.frontend.favIcon
                if (typeof fav === 'string' && /^\/[^/]/.test(fav)) this.routes.frontend.favIcon = siteBase + '/app_frontend' + fav
                this.cdnRewrites = this.cdnRewritesFor(siteBase)
            }


            var render = async (res, page, userData, country) => {
                if (onCdn) {
                    this.routes.frontend.view = siteBase + '/views/' + this.id + '/'
                    // Browsers only start workers from the page's own site: template.ejs points workers made from
                    // these CDN folders at the same file here (the site still serves all of it)
                    this.routes.frontend.cdnMap = [
                        [siteBase + '/app_frontend/', '/'],
                        [siteBase + '/views/' + this.id + '/', this.info.route + 'vfe_frontend/'],
                        [siteBase + '/sk_frontend/', '/sk/'],
                        [siteBase + '/app_global/', '/sk_ui_global/'],
                        [siteBase + '/sk_ui_core/', this.sk.info.ui.routes.core],
                        [siteBase + '/sk_ui_shared/', this.sk.info.ui.routes.shared]
                    ]
                }
                

                var globalData = this.sk.info.globalData
                if (this.sk.info.dynamicGlobalData) globalData = {...globalData, ...this.sk.info.dynamicGlobalData()}

                var countries = await this.sk.info.l10n.listCountries()
                var phrases = await this.sk.info.l10n.getForCountry(country)

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
                    },
                    (err, html) => {
                        if (err) { console.error('[SK] Rendering ' + this.id + ' failed:', err); return res.status(500).send('Internal error') }
                        res.send(onCdn ? this.toCdn(html) : html)
                    }
                )
            }
           
            this.sk.app.use(this.routes.frontend.view, this.sk.info.engine.serveStatic(opt.root + 'frontend/'))
            if (this.sk.info.gate) this.sk.info.gate.route(this.sk.app, this.id, opt.root + 'frontend/sk_ui/', this.info.route + 'vfe_frontend/sk_ui/')
            this.sk.app.use(this.routes.frontend.global, this.sk.info.engine.serveStatic(this.sk.info.paths.globalFrontend))
        

            if (this.info.vanilla){
                this.sk.app.use('/vanillaFE', this.sk.info.engine.serveStatic(this.sk.info.paths.vanillaFrontend))
                this.routes.frontend.view = {}
            }

            this.sk.app.get(this.info.route, async (req, res)=>{
                //this.sk.stats.increment({type: 'get', route: this.info.route})

                if (this.onPreNavigate){
                    try {
                        var onPreNavigateRes = await this.onPreNavigate(req)
                        if (onPreNavigateRes){
                            if (onPreNavigateRes.redirect) return res.redirect(onPreNavigateRes.redirect)
                        }
                    } catch(err) {
                        console.error(err)
                    }
                }

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
                        var auth_res = await this.sk.info.engine.isAuthTokenValid(auth_token, true)
                    
                        if (auth_res){
                            if (auth_res.error === 'invalid_token'){
                                return res.redirect('/logout')
                            }


                            //check ban
                            var latestRestrictionRes = await this.sk.info.database.do.getLatestRestriction({user_id: auth_res.userID})
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
                                    (await this.sk.info.database.do.isAccActivated(auth_token)).accActivated
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
                    lang = userData.language || req.cookies.country || req.headers['accept-language'].split(',')[0].split('-')[0]
                } catch(err) {
                    lang = 'en'
                }

                var ejsPath = this.sk.info.paths.superkraft + '/template.ejs'
                if (this.info.vanilla){
                    ejsPath = this.root + 'frontend/view.ejs'
                }
                render(res, ejsPath, userData, lang)
            })
        

            resolve()
        })
    }
}