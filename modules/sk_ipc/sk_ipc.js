module.exports = class SK_IPC {
    constructor(opt){
        this.sk = opt.sk

        var app_type = (this.sk.app_type ? this.sk.app_type : this.sk.info.type)

        if (app_type === 'japp') this.ipc = new (require('./sk_ipc_juce.js'))({parent: this, source: opt.source})
    }

    on(eventID, cb){
        this.ipc.on(eventID, cb)
    }

    toCBE(cmd, data) { return this.ipc.toCBE(cmd, data) }

    toView(viewID, cmd, data) { return this.ipc.sendToView(viewID, cmd, data) }

    execute_Callback_From_C_Backend(msgID, data) {
        this.ipc.execute_Callback_From_C_Backend(msgID, data)
    }
}