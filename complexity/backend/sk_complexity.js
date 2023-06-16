module.exports = class SS_Complexity {
    constructor(){
        this.paths = {
            root: (global.sk.paths.superkraft + '/complexity/').split('\\').join('/'),
            frontend: (global.sk.paths.superkraft + '/complexity/frontend/').split('\\').join('/'),
            actions: (__dirname + '/actions/').split('\\').join('/'),
            bakery: (global.sk.paths.root + '/sk_bakery/').split('\\').join('/')
        }
    }

    init(){
        this.actions = sk.utils.loadActions(this.paths.actions)
        sk.utils.captureActions('complexity', this.actions)
    }
}