var fs = require('fs')


module.exports = class SK_WAPP_Mobile {
    constructor(opt){

    }
    
    log(msg){
        console.log('[SK MOBILE] ' + msg)
    }

    error(){
        console.error('[SK MOBILE] ' + msg)
    }

    init(){
        return new Promise(async resolve => {
            var fail = msg => {
                this.error(msg)
                resolve()
            }

            if (!global.sk.mobile.splash.route) return fail('No route set for splash images')
            if (!global.sk.mobile.splash.container) return fail('No output container defined for splash images')
            
            if (!fs.existsSync(global.sk.mobile.splash.container + 'sk_splash.ejs')){
                this.pwaAssetGenerator = require('pwa-asset-generator')
                if (!global.sk.mobile.splash.input) return fail('No input file defined for splash images')
                await this.generateSplashImages()
            }
            resolve()
        })
    }

    generateSplashImages(){
        return new Promise(async resolve => {
            this.log('Generating splash images...')
            
            var defOpt = {
                ...{splashOnly: true, log: false, path: global.sk.mobile.splash.route},
                ...global.sk.mobile.splash.options
            }
            await this.pwaAssetGenerator.generateImages(global.sk.mobile.splash.input, global.sk.mobile.splash.container, defOpt)
  


            const appleDeviceSpecsForLaunchImages = this.pwaAssetGenerator.appleDeviceSpecsForLaunchImages

            this.splashHTML = appleDeviceSpecsForLaunchImages.map(spec => {   
                var _p = `<link key="apple-splash-${spec.portrait.width}-${spec.portrait.height}" rel="apple-touch-startup-image" href="${global.sk.mobile.splash.route}apple-splash-${spec.portrait.width}-${spec.portrait.height}.jpg" media="device-width: ${spec.portrait.width / spec.scaleFactor}px) and (device-height: ${spec.portrait.height / spec.scaleFactor}px) and (-webkit-device-pixel-ratio: ${spec.scaleFactor}) and (orientation: portrait)" />`
                var _l = `<link key="apple-splash-${spec.landscape.width}-${spec.landscape.height}" rel="apple-touch-startup-image" href="${global.sk.mobile.splash.route}apple-splash-${spec.landscape.width}-${spec.landscape.height}.jpg" media="device-width: ${spec.landscape.width / spec.scaleFactor}px) and (device-height: ${spec.landscape.height / spec.scaleFactor}px) and (-webkit-device-pixel-ratio: ${spec.scaleFactor}) and (orientation: landscape)" />`

                return _p + '\n' + _l
            })

            fs.writeFileSync(global.sk.mobile.splash.container + 'sk_splash.ejs', this.splashHTML.join('\n'))

            this.log('OK!')
            resolve()
        })
    }
}