module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v, srcOpt, validationRes){
        var req = require('electron')
        var shell = req.shell
        var path = opt.url

        function isValidHttpUrl(string) {
            let url
            
            try {
                url = new URL(string)
            } catch (_) {
                return false
            }
          
            return url.protocol === "http:" || url.protocol === "https:"
        }

        if (opt.browser || isValidHttpUrl(opt.url)){
            shell.openExternal(path);
            return
        }

        if (global.sk.os.platform() === 'win32') shell.openItem(path)
        else shell.showItemInFolder(path)

        //return info
        res.resolve({})
    }
}