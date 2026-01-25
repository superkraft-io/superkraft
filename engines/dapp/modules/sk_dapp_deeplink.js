var fs = require('fs')


module.exports = class SK_DAPP_Deeplink {
    constructor(opt){
        this.opt = opt
        this.sk = opt.sk

        if (!this.sk.info.dapp.deeplink) return

        this.configSchemes()

        if (this.sk.info.sysInfo.os === 'win') this.osModule = new SK_DAPP_Deeplink_win({parent: this, sk: this.sk})
        else this.osModule = new SK_DAPP_Deeplink_mac({parent: this, sk: this.sk})

        this.osModule.init()

        //terminate if already running
        this.instanceMgr = new (require('./sk_dapp_instanceMgr.js'))()

        this.osModule.monitor()
    }

    configSchemes(){
        this.sk.app.setAsDefaultProtocolClient(this.sk.info.dapp.deeplink.scheme)
    }

    parseData(data){
        try {
            var results = {pairs: {}}

            var str = data.replace(this.sk.info.dapp.deeplink.scheme + '://', '')

            var qSplit = str.split('?')
            results.start = qSplit[0]

            var pairsSplit = qSplit[1].split('&')

            for (var i in pairsSplit){
                var pair = pairsSplit[i]
                var pSplit = pair.split('=')
                results.pairs[pSplit[0]] = pSplit[1]
            }

            return results
        } catch(err) {
            var x = 0
        }
    }
}


class SK_DAPP_Deeplink_win {
    constructor(opt){
        this.opt = opt
        this.sk = opt.sk

        this.appName = this.sk.app.name.split(' ').join('-').toLowerCase()

        this.paths = {
            tmp: this.sk.app.getPath('temp') + '\\' + this.appName + '\\'
        }
        
        if (this.sk.info.sysInfo.os === 'mac') this.paths.tmp = this.paths.tmp.split('\\').join('//')

        if (!fs.existsSync(this.paths.tmp)) fs.mkdirSync(this.paths.tmp, { recursive: true })

        this.paths.deeplink = this.paths.tmp + 'deeplink.sk'

        
    }

    init(){
        var deeplinkData = undefined

        for (var i = 0; i < process.argv.length; i++){
            var entry = process.argv[i]
            if (entry.indexOf(this.sk.info.dapp.deeplink.scheme + '://') > -1){
                deeplinkData = this.opt.parent.parseData(entry)
                break
            }
        }

        if (!deeplinkData) return

        try { fs.unlink(this.paths.deeplink) } catch(err) {}

        fs.writeFileSync(this.paths.deeplink, JSON.stringify(deeplinkData))
    }

    monitor(){
        var busy = false
        this.monitorTimer = setInterval(()=>{
            if (busy) return
            if (!fs.existsSync(this.paths.deeplink)) return busy = false

            try { var stat = fs.statSync(this.paths.deeplink) } catch(err) {
                console.error('===== deeplink error: could not get stats of deeplink file')
                return
            }
            

            if (Date.now() - stat.ctimeMs > 750){
                try { fs.unlinkSync(this.paths.deeplink) } catch(err) {
                    console.error('===== deeplink error: could not unlink existing file')
                }
                return
            }

            busy = true

            try { 
                var data = JSON.parse(fs.readFileSync(this.paths.deeplink))
                this.sk.info.ums.broadcast('sk_deeplink', data)
            } catch(err) {
                console.error('===== deeplink error: could not read deeplink file')
            }

            busy = false
        }, 500)
    }
}

class SK_DAPP_Deeplink_mac {
    constructor(opt){
        this.opt = opt
        this.sk = opt.sk
    }

    init(){
        this.sk.app.on('open-url', (event, url)=>{
            event.preventDefault()

            var data =  this.opt.parent.parseData(url)
            this.sk.info.ums.broadcast('sk_deeplink', data)
        })
    }

    monitor(){
        //do nothing on mac
    }
}
