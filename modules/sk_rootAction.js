module.exports = class SK_RootAction {
    constructor(view){
        this.view = view
    }

    run(view, opt, srcOpt, validationRes){
        return new Promise((resolve, reject) => {
            this.exec(opt, {resolve: resolve, reject: reject}, view, view._view, srcOpt, validationRes)
        })
    }


}