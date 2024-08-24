module.exports = module.exports = class SK_IPC {
    constructor(opt) {
        if (!opt.source || opt.source.toString().trim().length === 0) throw "IPC SOURCE ID MUST BE DEFINED!!!"

        this.parent = opt.parent

        this.source = opt.source
        this.msgID = 0
        this.callbacks = {}
        this.events = {}

        window.__JUCE__.backend.addEventListener('sk.ipc', _res => {
            try { var res = JSON.parse(_res) } catch (err) { var res = _res }

            if (res.type === 'response') {
                var cbRes = this.handleCallback(res.sourceMsgID || res.msgID, (res.error ?
                    { error: res.error, code: res.error }
                    :
                    res.data
                ))
            }

            if (this.onUnexpectedMessage) this.onUnexpectedMessage(res)
        })

        /*
        window.__JUCE__.backend.addEventListener('sk.ipc.event', _res => {
            var res = JSON.parse(_res)


            var event = this.events[res.eventID]

            if (!event) return console.error(`No IPC event with id ${res.eventID} exists`)

            res.data = JSON.parse(res.data)

            event(res, cb_res => {
                this.toCBE('sk.ipc.response', {
                    target: 'sk_c_be',
                    cmd: 'sk',
                    data: cb_res
                })
            })
        })
        */

    }

    sendRaw(cmd, data) {
        window.__JUCE__.backend.emitEvent(cmd, data)
    }

    requestWithCallback(target, _data, cb) {
        this.msgID++

        if (target === 'sk:web') {
            console.log(this.msgID)
            console.log(_data)
        }

        this.addCallback(this.msgID, cb)

        var data = {
            type: 'request',
            source: this.source,
            target: target,
            msgID: this.msgID,
            data: _data
        }

        this.sendRaw('sk.ipc', data)
    }

    request(target, _data = '') {
        return new Promise((resolve, reject) => {
            this.requestWithCallback(target, _data, res => {
                if (res.error) return reject(res)
                resolve(res)
            })
        })
    }

    respond(target, sourceMsgID, _data, data) {
        this.msgID++

        var data = {
            type: 'response',
            source: this.source,
            sourceMsgID: sourceMsgID,
            target: target,
            msgID: this.msgID,
            data: _data
        }

        this.sendRaw('sk.ipc', data)
    }

    addCallback(msgID, cb) {
        this.callbacks[msgID] = {
            timestamp: Date.now(),
            msgID: msgID,
            cb: cb
        }
    }

    handleCallback(msgID, data) {
        var entry = this.callbacks[msgID]
        if (entry) {

            var roundtripTime = Date.now() - entry.timestamp
            //console.log(roundtripTime)

            entry.cb(data)
            delete this.callbacks[msgID]

            return true
        }
    }

    on(cmd, cb) {
        this.events[cmd] = cb
    }
}
