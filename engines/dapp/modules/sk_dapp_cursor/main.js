const {uIOhook, UiohookKey} = require('uiohook-napi')


module.exports = class SK_DAPP_Cursor extends SK_RootView {
    constructor(opt){
        super(opt)
        
        this.info = {
            title: 'SK Cursor',

            width: 16,
            height: 16,
            minimizable: false,
            maximizable: false,

            minWidth: 16,
            minHeight: 16,

            alwaysOnTop: true,
            skipTaskbar: true,

            resizable: false,
            movable: false,

            show: true,

            ignoreMouseEvents: true,
            focusable: false
        }

        uIOhook.on('mousemove', _e => {
            this._view.setPosition(_e.x, _e.y)
        })
        uIOhook.start()
    }

    set cursor(val){
        this.__cursor = val
    }

    get cursor(){ return this.__cursor }
}