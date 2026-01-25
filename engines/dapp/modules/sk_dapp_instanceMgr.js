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

        this.maybeQuit()
        this.updateLockFile()
    }

    updateLockFile(){
        fs.writeFileSync(this.lockFilePath, process.pid.toString())
    }
    
    maybeQuit(){
        try {
            var pid = fs.readFileSync(this.lockFilePath).toString()

            try {
                var isRunning = process.kill(pid, 0)
                global.sk.engine.terminate()
                return
            } catch(err) {
                var x = 0
            }
        } catch(err) {
            var x = 0
        }
    }
}