const {app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')

module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v){
        if (opt.type === 'open' || opt.type === 'save'){
            var defOpt = {}
            defOpt = {...defOpt, ...opt.options}

            if (defOpt.defaultPath){
                try {
                    var defaultPath = String(defOpt.defaultPath)
                    // Bare filenames (esp. with spaces) get truncated in the Windows
                    // save dialog unless they are absolute. Anchor them to Downloads.
                    var isAbsolute = path.isAbsolute(defaultPath)
                    if (!isAbsolute && opt.type === 'save') {
                        defaultPath = path.join(app.getPath('downloads'), defaultPath)
                    }
                    if (sk.info.sysInfo.os === 'win') {
                        defaultPath = defaultPath.split('/').join('\\')
                    }
                    defOpt.defaultPath = defaultPath
                } catch(err) {
                    console.error('[DAPP DIALOG] Invalid default path', err)
                }
            }

            var fileRes = await dialog['show' + (opt.type === 'open' ? 'Open' : 'Save') + 'Dialog'](_v, defOpt)
            res.resolve(fileRes)
        }

        if (opt.type === 'message'){
            var msgOpt = {
                ...opt.settings,
                ...{message: opt.settings.message.split('\\n').join('\n')}
            }

            var dlgRes = await dialog.showMessageBox(msgOpt)
            res.resolve(dlgRes)
        }
    }
}