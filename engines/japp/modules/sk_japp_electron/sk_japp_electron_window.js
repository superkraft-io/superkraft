

module.exports = class SK_JAPP_View {
    constructor(parent){
        this.parent = parent
        this.events = {}
    }

    async __init__(opt){
        
    }

    dispatch(eventName, _e){
        var event = this.events[eventName]
        if (!event) return console.error(`[ SK_SAPP_Electron_Window.send() ] Event "${eventName}" does not exist`)
        event.cb(_e)
    }

    on(eventName, cb){
        this.events[eventName] = {cb: cb}

        /*
        if (!this.__window) return

        this.__window.on(eventName, res => {
            cb(res)
        })*/
    }


    show(){
        this.__window.show()
        this.dispatch('show')
    }

    hide(){
        this.__window.hide()
        this.dispatch('hide')
    }

    close(){
        this.dispatch('closed')
    }

    async loadURL(data, url, opt){
        ejs_juce.data(data)
        var ejsData = await ejs_juce.protocolListener({ url: url })
        await fs.promises.writeFile('sk_vfs' + this.parent.routes.frontend.view + 'view.html', ejsData)

        this.res = SK_JAPP_View.createView(opt)
        
        this.dispatch('ready-to-show')
    }

    /*******/

    static async createView(opt) {
        var res = await sk.ipc.ipc.request('sk:viewMngr', { action: 'createView', info: opt })

    }

    set backgroundColor(clr) {
        this.__bgClr = clr
        sk.ipc.ipc.request('sk:viewMngr', { action: 'setBgClr', clr: clr }).then(() => { })
    }

    get backgroundColor() { return this.__bgClr }
}
