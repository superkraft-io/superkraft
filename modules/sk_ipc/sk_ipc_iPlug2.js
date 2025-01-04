module.exports =  class SK_IPC {
    constructor(opt) {
        if (!opt.source || opt.source.toString().trim().length === 0) throw "IPC SOURCE ID MUST BE DEFINED!!!"

        this.parent = opt.parent
    }

    sendRaw(cmd, data) {
        console.error('sendRAW is deprecated in iPlug2')
    }

    requestWithCallback(target, _data, cb) {
        sk_api.ipc.request(cmd, data)
        .then(res => {
            cb(res)
        })
        .catch(err => {
            cb(err)
        })
    }

    request(target, data = '') {
        return sk_api.ipc.request(cmd, data)
    }

    on(cmd, cb) {
        sk_api.ipc.on(cmd, (res, rW) => {
            cb(res, rW)
        })
    }
}
