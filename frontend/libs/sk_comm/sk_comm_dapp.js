var WebSockets_Callback = require('wscb')
var wscb = new WebSockets_Callback({asElectron: true, asClient: true})
var sk_communicator = {
    send: opt => {
        return new Promise((resolve, reject)=>{
            wscb.send(opt, res => {
                resolve(res)
            })
        })
    }
}
