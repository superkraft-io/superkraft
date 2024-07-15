module.exports = module.exports = class SK_IPC {
    constructor() {
        this.msgIdx = 0
        this.callbacks = {}

        window.__JUCE__.backend.addEventListener('sk.ipc.callback', _res => {
            var res = JSON.parse(_res)
            this.handleCallback(res.msgIdx, res.data)
        })
    }

    send(target = 'sk_c_be', cmd, data = {}, cb, preData = {}) {
        this.msgIdx++
        if (cb) this.addCallback(this.msgIdx, cb)
        window.__JUCE__.backend.emitEvent(
            'sk.ipc',
            {
                ...preData,
                ...{
                    target: target,
                    cmd: cmd,
                    msgIdx: this.msgIdx,
                    data: JSON.stringify(data),
                    hasCallback: cb !== undefined
                }
            }
        )
    }

    sendTo_C_backend_cb(cmd, data, cb) {
        this.send('sk_c_be', cmd, data, cb)
    }


    sendToView_cb(viewID, data, cb) {
        this.send('sk_view', cmd, data, cb, { viewID: viewID })
    }

    sendTo_C_backend(cmd, data) {
        return new Promise((resolve, reject) => {
            this.send('sk_c_be', cmd, data, res => {
                resolve(res)
            })
        })
    }

    toCBE(cmd, data) { return this.sendTo_C_backend(cmd, data) }


    sendToView(viewID, cmd, data) {
        return new Promise((resolve, reject) => {
            this.send('sk_view', cmd, data, res => {
                resolve(res)
            }, { viewID: viewID })
        })
    }

    toView(viewID, cmd, data) { return this.sendTo_C_backend(viewID, cmd, data) }

    addCallback(msgIdx, cb) {
        this.callbacks[msgIdx] = {
            timestamp: Date.now(),
            msgIdx: msgIdx,
            cb: cb
        }
    }

    handleCallback(msgIdx, data) {
        var entry = this.callbacks[msgIdx]
        if (entry) {
            entry.cb(data)
            delete this.callbacks[msgIdx]
        }
    }
}