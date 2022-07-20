module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, window, wnd){
        switch (opt.action) {

            case 'close':
                if (window.info.main || opt.terminate) global.sk.app.quit()
                else wnd.close()
                break;

            case 'minimize':
                wnd.minimize();
                break;

            case 'maximize':
                if (opt.reset){
                    wnd.isMaxxed = false
                    return
                }

                if (!wnd.isMaxxed){
                    wnd.isMaxxed = true
                    wnd.maximize()
                } else {
                    wnd.isMaxxed = false
                    wnd.unmaximize()
                }
                break;
        
            default:
                break;
                
        }
        
        res.resolve({})
    }
}