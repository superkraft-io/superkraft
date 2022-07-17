module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, window, wnd){
        switch (opt.action) {

            case 'close':
                if (window.info.main) global.app.quit()
                else wnd.close()
                break;

            case 'minimize':
                wnd.minimize();
                break;

            case 'maximize':
                if (!wnd.isMaximized()) wnd.maximize()
                else wnd.unmaximize()
                break;
        
            default:
                break;
                
        }
        
        res.resolve({})
    }
}