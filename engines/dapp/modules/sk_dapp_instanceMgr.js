var fs = require('fs')

module.exports = class SK_Dapp_InstanceMgr {
    constructor(){
        this.appName = global.sk.app.name.split(' ').join('-').toLowerCase()

        this.paths = {
            tmp: global.sk.app.getPath('temp') + '\\' + this.appName + '\\'
        }

        if (global.sk.info.sysInfo.os === 'mac') this.paths.tmp = this.paths.tmp.split('\\').join('//')

        if (!fs.existsSync(this.paths.tmp)) fs.mkdirSync(this.paths.tmp)

        this.lockFilePath = this.paths.tmp + 'lock.sk'
        this.updateLockFile()
    }

    updateLockFile(){
        fs.writeFileSync(this.lockFilePath, process.pid.toString())
    }
}
