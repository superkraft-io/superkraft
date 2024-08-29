console.log('openURL')

module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v, srcOpt, validationRes) {
        var req = require('electron')
        var shell = req.shell
        var path = opt.url

        function isValidHttpUrl(string) {
            let url = undefined
            try { url = new URL(string) } catch (_) { return false }
            return url.protocol === "http:" || url.protocol === "https:"
        }

        if (opt.browser || isValidHttpUrl(opt.url)) return shell.openExternal(path)

        if (this.sk.sysInfo.os === 'win') shell.openPath(path.split('/').join('\\'))
        else shell.showItemInFolder(path)

        res.resolve({})
    }
}