module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, window, wnd){
        switch (opt.action) {
            case 'close':
                if (window.info.main || opt.terminate) global.sk.app.quit()
                else window.hide()
                break;

            case 'minimize':
                wnd.minimize()
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

            case 'reload':
                window.reload()
                break;
        
            default:
                try {
                    global.sk.views[opt.view][opt.action]()
                } catch(err) {
                    console.error(err)
                }
                break;
                
        }
        
        res.resolve({})
    }
}