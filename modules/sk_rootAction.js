module.exports = class SK_RootAction {
    constructor(opt){
        this.sk = opt.sk
        this.view = opt.view
        if (this.init) this.init()
    }

    // An exec that throws, or returns a promise that rejects, rejects the call too: before, the
    // caller waited forever (a missing drive, a failed write, a binary that can't run).
    run(view, opt, srcOpt, validationRes){
        return new Promise((resolve, reject) => {
            var fail = err => reject({
                error: (err && (err.error || err.code)) || 'actionFailed',
                detail: String((err && err.message) || err)
            })
            try {
                Promise.resolve(this.exec(opt, {resolve: resolve, reject: reject}, view, view._view, srcOpt, validationRes)).catch(fail)
            } catch (err) {
                fail(err)
            }
        })
    }


}