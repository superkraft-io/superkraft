if (!window.sk_api){
console.log('SK_API loaded')

window.WebSockets_Callback = require('wscb')
window.wscb = new WebSockets_Callback({asElectron: true, asClient: true})

class SK_API_IPC {
    constructor(){
    }

    on(eventID, cb){
        wscb.on(eventID, cb)
    }

    request(cmd, payload, cb){
        wscb.send({
            ...{cmd: cmd}, 
            ...payload
        }, cb)
    }
}

class SK_API_Window {
    constructor(){
    }

    on(eventID, cb){
        wscb.on(eventID, cb)
    }

    request(cmd, payload, cb){
        wscb.send({
            ...{cmd: cmd}, 
            ...payload
        }, cb)
    }
}


class SK_API_StaticInfo {
    constructor(){
        this.application = {
            name: 'Splitter Studio',
            version: window.sk ? window.sk.app.getVersion() : 'unknown'
        }
    }
}

class SK_API {
    constructor(sk){
        this.sk = sk
        this.ipc = new SK_API_IPC(sk)
        this.window = new SK_API_Window(sk)
        this.staticInfo = new SK_API_StaticInfo(sk)

        this.waitForSKReady()
    }

    waitForSKReady(){
        var timer = setInterval(() => {
            if (!window.sk) return
            clearInterval(timer)
            window.sk.engineInitialized = true
        }, 10)
    }

    waitForWndReady(){
        return new Promise(resolve => {
            resolve()
        })
    }
}



window.sk_api = new SK_API()
}