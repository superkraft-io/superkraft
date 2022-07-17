module.exports = class SS_Complexity {
    constructor(){
        this.paths = {
            root: global.sk.paths.superstructure + '/complexity/',
            frontend: global.sk.paths.superstructure + '/complexity/frontend/',
            actions: __dirname + '/actions/',
            bakery: global.sk.paths.root + '/ss_bakery/'
        }
    }

    init(){
        this.actions = sk.utils.loadActions(this.paths.actions)
        sk.utils.captureActions('complexity', this.actions)
    }
}