module.exports = class SS_Complexity {
    constructor(){
        this.paths = {
            root: global.sk.paths.superkraft + '/complexity/',
            frontend: global.sk.paths.superkraft + '/complexity/frontend/',
            actions: __dirname + '/actions/',
            bakery: global.sk.paths.root + '/sk_bakery/'
        }
    }

    init(){
        this.actions = sk.utils.loadActions(this.paths.actions)
        sk.utils.captureActions('complexity', this.actions)
    }
}