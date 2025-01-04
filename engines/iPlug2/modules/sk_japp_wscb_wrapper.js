module.exports = class SK_JAPP_WSCB_Wrapper {
    constructor(opt){
        this.sk = opt.sk
    }

    sendToAllWindows(){

    }

    send(opt, cb){
        var targetView = this.sk.views[opt.data.viewID]
        if (!targetView){
            console.error('[WSCB] ERROR!!! No view ID was defined')
            console.error(opt)
            return
        }
        var viewIdx = targetView.index


        this.sk.ssc.currentWindow.send({event: opt.cmd, window: viewIdx, value: opt}, res => {
            cb(res)
        })
    }

    on(name, cb){
        this.sk.ssc.currentWindow.on(name, (res, _rW)=>{
            if (cb) cb(res.detail, ()=>{
                console.error('CANNOT RESPOND TO IPC MESSAGE')
            })
        })
    }
}