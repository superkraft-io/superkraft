var application = require('application')

window.ejs_skxx = new (require(__dirname + '/ejs/ejs_skxx.js'))()

module.exports = class SKXX_Electron_App {
    constructor(opt){
        this.events = {}
    }

    async __init__(){
        await window.ejs_skxx.init()
    }

    send(eventName, _e){
        var event = this.events[eventName]
        if (!event) return console.error(`[ SKXX_Electron_App.send() ] Event "${eventName}" does not exist`)
        event.cb(_e)
    }

    on(eventName, cb){
        this.events[eventName] = {cb: cb}
    }

    whenReady(){
        return new Promise(resolve => {
            this.__whenReady_promise = resolve
        })
    }

    setAppReady(){
        this.__appIsReady = true
        this.__whenReady_promise()
        if (this.events.ready) this.events.ready.cb()
    }

    getLocale(){
        return navigator.language
    }

    getVersion() {
        return sk_api.staticInfo.application.version
    }
}