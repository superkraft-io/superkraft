const {app, BrowserWindow, dialog, ipcMain } = require('electron')

module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v){

        var fileRes = await dialog['show' + (opt.type === 'open' ? 'Open' : 'Save') + 'Dialog'](opt.settings)
        
        
        res.resolve(fileRes)
    }
}