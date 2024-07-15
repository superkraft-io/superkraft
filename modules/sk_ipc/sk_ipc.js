module.exports = class SK_IPC {
    constructor(opt){
        this.sk = opt.sk
        if (this.sk.info.type === 'japp') this.ipc = new (require(__dirname + '/sk_ipc_juce.js'))
    }

    on(eventID, cb){
        this.ipc.on(eventID, cb)
    }

    toCBE(cmd, data) { return this.ipc.toCBE(cmd, data) }

    toView(viewID, cmd, data) { return this.ipc.sendToView(viewID, cmd, data) }

    execute_Callback_From_C_Backend(msgIdx, data) {
        this.ipc.execute_Callback_From_C_Backend(msgIdx, data)
    }
}