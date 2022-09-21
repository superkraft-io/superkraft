var fs = require('fs')


module.exports = class SK_WAPP_Mobile {
    constructor(opt){
        this.opt = opt
        
        
        var viewInfo = {}

        this.viewTemplate = `
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes"> <!-- chrome -->
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

    templatAdd(str, val){
        this.viewTemplate += '\n' + str.replace('<%>', val)
    }

    initPathsAndRoutes(){
        this.paths = {root: global.sk.paths.root}
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

            if (mopts.manifest) fs.writeFileSync(this.paths.manifest, JSON.stringify(mopts.manifest))

            if (!fs.existsSync(this.paths.splashTemplate)){
                if (!mopts.splash.input) return fail('No input file defined for splash images')
                this.pwaAssetGenerator = require('pwa-asset-generator')
                await this.generateSplashImages()
            }
            


            if (global.sk.paths.icons.app) this.templatAdd('<link rel="apple-touch-icon" href="<%>">', global.sk.paths.icons.app)
            if (global.sk.mobile.title) this.templatAdd('<meta name="apple-mobile-web-app-title" content="<%>">', global.sk.mobile.title)
            if (global.sk.mobile.hideNativeUI) this.templatAdd('<meta name="apple-mobile-web-app-capable" content="yes"></meta>')
            if (global.sk.mobile.statusBarStyle) this.templatAdd('<meta name="apple-mobile-web-app-status-bar-style" content="<%>">', global.sk.mobile.statusBarStyle)
            if (fs.existsSync(this.paths.manifest)) this.templatAdd('<link rel="manifest" href="<%>>" />', this.routes.manifest)
            if (fs.existsSync(this.paths.splashTemplate)){
                this.viewInfo.splash = this.paths.splashTemplate
                this.templatAdd('<%- include(sk.routes.frontend.mobile.splash) %>')
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
                ...global.sk.mobile.splash.options
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