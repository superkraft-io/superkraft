module.exports = class SS_Complexity {
    constructor(){
        this.paths = {
            root: global.ss.paths.superstructure + '/complexity/',
            frontend: global.ss.paths.superstructure + '/complexity/frontend/',
            actions: __dirname + '/actions/',
            bakery: global.ss.paths.root + '/ss_bakery/'
        }
    }

    init(){
        this.actions = ss.utils.loadActions(this.paths.actions)
        ss.utils.captureActions('complexity', this.actions)
    }
}