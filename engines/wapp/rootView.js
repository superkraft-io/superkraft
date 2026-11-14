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

    /**
     * The rendered page with those addresses on the CDN: only in the tags that load files, never in links.
     * Scripts and stylesheets from the CDN get crossorigin="anonymous" (the CDN answers with CORS): without it
     * the browser hides their errors as "Script error." with no file or line.
     */
    // page: {base, rewrites} the page was rendered with (its build); the current ones when left out
    toCdn(html, page){
        var rules = (page ? page.rewrites : this.cdnRewrites) || []
        var siteBase = page ? page.base : this.cdnSiteBase
        var cdnHost = siteBase ? new URL(siteBase).origin : null
        return html.replace(/<(link|script|img|source|video|audio)\b[^>]*>/gi, (tag, name) => {
            var out = tag.replace(/\b(src|href)=(["'])(\/[^"']*)\2/gi, (m, attr, q, url) => {
                for (var [from, to] of rules) if (url.startsWith(from)) return attr + '=' + q + to + url.slice(from.length) + q
                return m
            })
            var isLoad = /^script$/i.test(name) || (/^link$/i.test(name) && /\brel=["']?(stylesheet|preload|modulepreload)/i.test(out))
            if (cdnHost && isLoad && !/\bcrossorigin\b/i.test(out) && out.includes((/^script$/i.test(name) ? 'src=' : 'href=')) &&
                new RegExp('\\b(src|href)=["\']' + cdnHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/', 'i').test(out)) {
                out = out.replace(/^<(\w+)/, '<$1 crossorigin="anonymous"')
            }
            return out
        })
    }

    init(opt){
        return new Promise(async resolve => {
            this.route = opt.route

            var cdn = this.sk.info.cdn
            var cdnRoute = cdn.routes[this.sk.info.config.isWhat.env]
            var onCdn = cdn.targets.site === 'public'
            var trim = v => String(v).replace(/^\/+|\/+$/g, '')
            var cdnRoot = String(cdnRoute || '').replace(/\/?$/, '/')
            // Where the exported site (sk_cdnExporter) lives on the CDN: the current build's folder
            // (cdn.paths.builds/<build>/, Aurora's Deployments) or, before there is one, cdn.paths.site (releases/site)
            var legacyBase = onCdn ? cdnRoot + trim((cdn.paths && cdn.paths.site) || 'sk_cdn') : ''
            var buildsPath = trim((cdn.paths && cdn.paths.builds) || 'dashboard')
            // The app's cdnBuild() answers a build name, or {build, assets} with the build's packs: heavy parts kept
            // outside the build, {path in the export: 'assets/<12 hex>[/<file>]'} (Aurora's Deployments, cdn_assets.json)
            var segment = '[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+)*'
            var entryRe = new RegExp('^' + segment + '(?:/' + segment + ')*$')
            var targetRe = new RegExp('^assets/[0-9a-f]{12}(?:/' + segment + ')?$')
            var lastAnswer = {}
            var lastCdn = {base: legacyBase, assets: {}}
            var cdnNow = () => {
                if (!onCdn) return lastCdn
                var answer = null
                try { answer = this.sk.info.cdnBuild ? this.sk.info.cdnBuild() : null } catch(err) {}
                var build = answer && typeof answer === 'object' ? answer.build : answer
                var map = answer && typeof answer === 'object' && answer.assets && typeof answer.assets === 'object' ? answer.assets : null
                // The same answer as last time: nothing to work out again
                if (build === lastAnswer.build && map === lastAnswer.map) return lastCdn
                lastAnswer = {build: build, map: map}
                // It goes into every page's HTML: only a 12-character hex build and checked pack entries are used
                if (typeof build !== 'string' || !/^[0-9a-f]{12}$/.test(build)) return (lastCdn = {base: legacyBase, assets: {}})
                var assets = {}
                for (var key of Object.keys(map || {})) {
                    if (entryRe.test(key) && typeof map[key] === 'string' && targetRe.test(map[key])) assets[key] = cdnRoot + buildsPath + '/' + map[key]
                }
                return (lastCdn = {base: cdnRoot + buildsPath + '/' + build, assets: assets})
            }
            var siteBaseNow = () => cdnNow().base
            var siteBase = siteBaseNow()
            var favIconSource = this.sk.info.paths.icons.favIcon

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


            // Every address that depends on where the exported site is. Set once here, and again only when the build
            // changes (render below), so nothing is rebuilt or kept per request.
            var applySiteBase = base => {
                var f = this.routes.frontend
                f.sk = base + '/sk_frontend'
                f.app_root = base + '/app_frontend/'
                f.app = base + '/app_frontend/'
                f.global = base + '/app_global/'
                f.ui_cdn = base
                // The base styles and every core, shared and global component's own files (root_url)
                f.ui = base + '/sk_ui_core/'
                f.ui_shared = base + '/sk_ui_shared/'
                f.ui_global = base + '/app_global/'
                if (this.sk.info.ui.routes.font) f.font = base + '/sk_ui_font/'
                f.favIcon = (typeof favIconSource === 'string' && /^\/[^/]/.test(favIconSource)) ? base + '/app_frontend' + favIconSource : favIconSource
                this.cdnSiteBase = base
                this.cdnRewrites = this.cdnRewritesFor(base)
            }
            if (onCdn) applySiteBase(siteBase)


            var render = async (res, page, userData, country) => {
                // This page's own copy of the addresses, taken now: a build switching while it renders (the awaits
                // below) changes later pages, never half of this one
                var routes = this.routes
                var cdnPage = null
                if (onCdn) {
                    // A new build since the last page: its folder from now on (pages already open keep theirs)
                    var now = siteBaseNow()
                    if (now !== siteBase) {
                        siteBase = now
                        applySiteBase(siteBase)
                    }
                    var base = siteBase
                    routes = {...this.routes, frontend: {
                        ...this.routes.frontend,
                        view: base + '/views/' + this.id + '/',
                        // The build's packs: path in the export → its address (script.ejs gives pages sk.cdnAsset)
                        assets: cdnNow().assets,
                        // Browsers only start workers from the page's own site: template.ejs points workers made from
                        // these CDN folders at the same file here (the site still serves all of it)
                        cdnMap: [
                            [base + '/app_frontend/', '/'],
                            [base + '/views/' + this.id + '/', this.info.route + 'vfe_frontend/'],
                            [base + '/sk_frontend/', '/sk/'],
                            [base + '/app_global/', '/sk_ui_global/'],
                            [base + '/sk_ui_core/', this.sk.info.ui.routes.core],
                            [base + '/sk_ui_shared/', this.sk.info.ui.routes.shared]
                        ]
                    }}
                    cdnPage = {base: base, rewrites: this.cdnRewrites}
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
                        // This page's addresses (its build), not the shared ones
                        sk: {...this.viewInfo.sk, routes: routes},
                        // A web page: template.ejs paints it dark from the first frame (desktop windows stay transparent)
                        wappPage: true,
                        ...{
                            userData: userData,
                            globalData: globalData,
                        }
                    },
                    (err, html) => {
                        if (err) { console.error('[SK] Rendering ' + this.id + ' failed:', err); return res.status(500).send('Internal error') }
                        res.send(cdnPage ? this.toCdn(html, cdnPage) : html)
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

                // The login could not be checked or the page's data not read (the database is slow, restarting
                // or away): say so and let the browser try again. Such a visitor used to be sent to the login
                // page as if logged out, where the cookie could be deleted too.
                var unavailable = why => {
                    console.error('[SK] ' + this.info.route + ' not served, ' + why)
                    res.status(503).set('Retry-After', '5').set('Cache-Control', 'no-store').send('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="5"><meta name="color-scheme" content="dark"><title>One moment</title><style>html{background:rgb(20,20,20);color:#ddd;font:14px/1.5 system-ui,sans-serif}body{margin:0;box-sizing:border-box;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;padding:48px 24px 40px}p{margin:0 0 6px}.l{display:block;height:30px}.s{display:block;width:36px;height:36px;margin:0 auto 16px;animation:r 1s linear infinite}@keyframes r{to{transform:rotate(360deg)}}.b{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:150px;height:38px;margin-top:16px;padding:8px 12px;border-radius:8px;background:rgb(8,136,255);color:#fff;text-decoration:none}.b:hover{background:rgb(3,88,167)}.b:active{opacity:.5}.h{display:inline-flex;align-items:center;gap:8px;color:#888;text-decoration:none}.h:hover{color:#ddd}.h svg{width:13px;height:14px;fill:currentColor}</style></head><body><a href="/"><img class="l" src="/logo_white_text.png" alt="Splitter"></a><div><svg class="s" viewBox="0 0 36 36" fill="none" stroke-width="3" aria-hidden="true"><circle cx="18" cy="18" r="15" stroke="#333"/><path d="M18 3a15 15 0 0 1 15 15" stroke="#ddd" stroke-linecap="round"/></svg><p>We could not reach our servers just now. You are still logged in.</p><p>This page tries again in a few seconds.</p><a class="b" href="">Try now</a></div><a class="h" href="/help"><svg viewBox="0 0 448 512" aria-hidden="true"><path d="M448 360V24c0-13.3-10.7-24-24-24H96C43 0 0 43 0 96v320c0 53 43 96 96 96h328c13.3 0 24-10.7 24-24v-16c0-7.5-3.5-14.3-8.9-18.7-4.2-15.4-4.2-59.3 0-74.7 5.4-4.3 8.9-11.1 8.9-18.6zM128 134c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm0 64c0-3.3 2.7-6 6-6h212c3.3 0 6 2.7 6 6v20c0 3.3-2.7 6-6 6H134c-3.3 0-6-2.7-6-6v-20zm253.4 250H96c-17.7 0-32-14.3-32-32 0-17.6 14.4-32 32-32h285.4c-1.9 17.1-1.9 46.9 0 64z"/></svg>Help</a></body></html>')
                }

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
                                // A refused token (expired, revoked, purged): drop the cookie here and go to the
                                // login page. This used to go through the /logout page, which only removes the
                                // cookie in the browser: where the proxy doesn't route /logout to this app the
                                // visitor got a 404 and kept the dead cookie, so every later visit ended there too.
                                res.clearCookie('auth_token', {path: '/'})
                                return res.redirect(this.info.onAuthFail || '/login')
                            }


                            //check ban
                            try {
                                var latestRestrictionRes = await this.sk.info.database.do.getLatestRestriction({user_id: auth_res.userID})
                            } catch(err) {
                                return unavailable('the restriction check failed')
                            }
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
                            // No answer about the token (a refused one is handled above): not a logout
                            if (this.info.onAuthFail){
                                return unavailable('the login check failed')
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
                        // A view rejects on purpose for a page that doesn't exist (a used ticket); a database
                        // that didn't answer is not that
                        var dbDown = err && ['dbTimeout', 'dbUnavailable', 'dbNoResponse'].includes(err.error)
                        if (dbDown) return unavailable('its data could not be read (' + err.error + ')')
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