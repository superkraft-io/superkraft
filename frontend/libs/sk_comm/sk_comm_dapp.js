var WebSockets_Callback = require('wscb')
var sk_communicator = {
    send: opt => {
        return new Promise((resolve, reject)=>{
            wscb.send(opt, res => {
                resolve(res)
            })
        })
    }
}
