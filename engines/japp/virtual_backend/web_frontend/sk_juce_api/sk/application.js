
module.exports = class SK_Application {
    constructor(opt) {
    }

    async init() {
        var res = await window.sk_ipc.ipc.request('sk:application', { func: 'getAppInfo' })
        this.mode = res.mode
        this.name = res.name
        this.version = version
    }
}