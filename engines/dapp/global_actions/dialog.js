const {app, BrowserWindow, dialog, ipcMain } = require('electron')

module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v){
        if (opt.type === 'open' || opt.type === 'save'){
            var defOpt = {}
            defOpt = {...defOpt, ...opt.options}
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