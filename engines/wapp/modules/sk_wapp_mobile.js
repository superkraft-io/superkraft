var fs = require('fs')


module.exports = class SK_WAPP_Mobile {
    constructor(opt){
        this.opt = opt
        this.sk = opt.sk
        
        var viewInfo = {}

        this.viewTemplate = `
<meta name="apple-touch-fullscreen" content="yes">
        `

        this.viewInfo = {}
    }
    
    log(msg){
        console.log('[SK MOBILE] ' + msg)
    }

    error(){
        console.error('[SK MOBILE] ' + msg)
    }

    templateAdd(str, val){
        this.viewTemplate += str.replace('<%>', val)
    }

    initPathsAndRoutes(){
        this.paths = {root: this.sk.paths.root}
        var pCopyAdd = (from, key, path) => { this.paths[key] = this.paths[from] + path + '/' }

        pCopyAdd('root', 'container', 'sk_wapp_mobile')
        pCopyAdd('container', 'splash', 'splash')
        pCopyAdd('container', 'icons', 'icons')

        this.paths.mainTemplate = this.paths.container + 'sk_mobile.ejs'
        this.viewInfo.main = this.paths.mainTemplate

        this.paths.splashTemplate = this.paths.container + 'sk_plash.ejs'
        this.paths.manifest = this.paths.container + 'sk_manifest.json'

        /********/

        this.routes = {root: ''}
        var rCopyAdd = (from, key, val) => { this.routes[key] = this.routes[from] +  '/' + val }

        rCopyAdd('root', 'container', 'sk_wapp_mobile')
        rCopyAdd('container', 'splash', 'splash')
        rCopyAdd('container', 'icons', 'icons')


        this.routes.manifest = this.routes.container + '/sk_manifest.json'
    }

    init(){
        return new Promise(async resolve => {
            if (!this.opt.mopts) return

            var mopts = this.opt.mopts

            var fail = msg => {
                this.error(msg)
                resolve()
            }

            this.initPathsAndRoutes()

            try { fs.mkdirSync(this.paths.container) } catch(err) {}

            
            this.opt.xapp.use(this.routes.container, this.opt.express.static(this.paths.container))

            
            if (mopts.splash){
                if (!fs.existsSync(this.paths.splashTemplate)){
                    if (!mopts.splash.input) return fail('No input file defined for splash images')
                    this.pwaAssetGenerator = require('pwa-asset-generator')
                    await this.generateSplashImages()
                }
            }
            

            var manifest = {
                scope: '/localhost'
            }

            var props = ['width=device-width', 'initial-scale=1.0']
            if (!this.sk.mobile.allowScaling) props.push('user-scalable=no')
            this.templateAdd(`<meta name="viewport" content="${props.join(', ')}">`)
            
            if (this.sk.paths.icons.app) this.templateAdd('<link rel="apple-touch-icon" href="<%>">', this.sk.paths.icons.app)
            if (this.sk.mobile.name){
                manifest.name = this.sk.mobile.name
                this.templateAdd('<meta name="apple-mobile-web-app-title" content="<%>">', this.sk.mobile.name)
            }

            if (this.sk.mobile.name) manifest.short_name = this.sk.mobile.short_name
            if (this.sk.mobile.start_url) manifest.start_url = this.sk.mobile.start_url
            if (this.sk.mobile.categories) manifest.categories = this.sk.mobile.categories

            if (this.sk.mobile.nativeStyle){
                var nS = this.sk.mobile.nativeStyle
                if (nS === true) nS = 'fullscreen'
                if (nS !== undefined && nS !== false && nS !== true) manifest.display = nS
                this.templateAdd('<meta name="apple-mobile-web-app-capable" content="yes"></meta>')
                this.templateAdd('<meta name="mobile-web-app-capable" content="yes">')
            }
            if (this.sk.mobile.statusBarStyle) this.templateAdd('<meta name="apple-mobile-web-app-status-bar-style" content="<%>">', this.sk.mobile.statusBarStyle)
            
            fs.writeFileSync(this.paths.manifest, JSON.stringify(manifest))
            this.templateAdd('\n<link rel="manifest" href="<%>" />', this.routes.manifest)

            if (fs.existsSync(this.paths.splashTemplate)){
                this.viewInfo.splash = this.paths.splashTemplate
                this.templateAdd('<%- include(sk.routes.frontend.mobile.splash) %>')
            }
            

            fs.writeFileSync(this.paths.mainTemplate, this.viewTemplate)

            resolve()
        })
    }

    generateSplashImages(){
        return new Promise(async resolve => {
            var mopts = this.opt.mopts

            this.log('Generating splash images...')

            this.log('Creating splash folder')
            try { fs.mkdirSync(this.paths.splash) } catch(err) {}

            
            this.log('Creating splash images')
            var defOpt = {
                ...{splashOnly: true, log: false, path: mopts.splash.route},
                ...this.sk.mobile.splash.options
            }
            await this.pwaAssetGenerator.generateImages(mopts.splash.input, this.paths.splash, defOpt)
  


            const appleDeviceSpecsForLaunchImages = this.pwaAssetGenerator.appleDeviceSpecsForLaunchImages

            this.splashHTML = appleDeviceSpecsForLaunchImages.map(spec => {   
                var _p = `<link rel="apple-touch-startup-image" href="${this.routes.splash}/apple-splash-${spec.portrait.width}-${spec.portrait.height}.jpg" media="(device-width: ${spec.portrait.width / spec.scaleFactor}px) and (device-height: ${spec.portrait.height / spec.scaleFactor}px) and (-webkit-device-pixel-ratio: ${spec.scaleFactor}) and (orientation: portrait)" />`
                var _l = `<link rel="apple-touch-startup-image" href="${this.routes.splash}/apple-splash-${spec.landscape.width}-${spec.landscape.height}.jpg" media="(device-width: ${spec.landscape.width / spec.scaleFactor}px) and (device-height: ${spec.landscape.height / spec.scaleFactor}px) and (-webkit-device-pixel-ratio: ${spec.scaleFactor}) and (orientation: landscape)" />`
                return _p + '\n' + _l
            })

            this.log('Saving splash template')
            fs.writeFileSync(this.paths.splashTemplate, this.splashHTML.join('\n'))

            this.log('Splash generator done!')
            resolve()
        })
    }
}