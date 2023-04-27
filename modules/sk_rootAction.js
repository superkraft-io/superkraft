module.exports = class SK_RootAction {
    constructor(opt){
        this.sk = opt.sk
        this.view = opt.view
        if (this.init) this.init()
    }

    run(view, opt, srcOpt, validationRes){
        return new Promise((resolve, reject) => {
            this.exec(opt, {resolve: resolve, reject: reject}, view, view._view, srcOpt, validationRes)
        })
    }


}