module.exports = class SK_Action extends SK_RootAction {
    exec(opt, res, window, wnd){
        switch (opt.action) {
            case 'close':
                if (window.info.main || opt.terminate) this.sk.engine.terminate()
                else window.close()//hide()
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

            case 'unmaximize':
                wnd.unmaximize()
                break;

            case 'reload':
                window.reload()
                break;

            case 'focus':
                try {
                    if (wnd.isMinimized()) wnd.restore()
                    wnd.setAlwaysOnTop(true)
                    wnd.show()
                    if (typeof wnd.moveTop === 'function') wnd.moveTop()
                    wnd.focus()
                    if (this.sk && this.sk.app && typeof this.sk.app.focus === 'function') {
                        this.sk.app.focus({steal: true})
                    }
                    wnd.focus()
                    wnd.flashFrame(true)
                    setTimeout(() => {
                        try { wnd.setAlwaysOnTop(false) } catch (err) {}
                    }, 400)
                } catch (err) {}
                break;

            case 'blurAttention':
                try { wnd.flashFrame(false) } catch (err) {}
                try { wnd.setAlwaysOnTop(false) } catch (err) {}
                break;
        
            case 'isMaximized':
                res.resolve({isMaximized: wnd.isMaximized()})
                break;

            case 'isfullscreen':
                res.resolve({isFullscreen: wnd.isFullscreen()})
                break;

            default:
                try {
                    this.sk.views[opt.view][opt.action]()
                } catch(err) {
                    console.error(err)
                }
                break;
                
        }
        
        res.resolve({})
    }
}