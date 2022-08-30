const {app, BrowserWindow, dialog, ipcMain } = require('electron')

module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v){
        if (opt.type === 'open' || opt.type === 'save'){
            var fileRes = await dialog['show' + (opt.type === 'open' ? 'Open' : 'Save') + 'Dialog'](opt.options)
            res.resolve(fileRes)
        }

        if (opt.type === 'message'){
            var dlgRes = await dialog.showMessageBox(opt.settings)
            res.resolve(dlgRes)
        }
    }
}