
class sk_ui_complexity_comm {
    constructor(){
        sk.complexity.actions = {}

        this.send = (action, data)=>{
            return sk.comm.call('complexity', action, data)
        }
    }

    async init(){
        var res = await this.send('getComplexityInfo')


        var configureActions = actions => {
            var configAction = action => {
                sk.complexity.actions[action] = opt => { return this.send(action, opt) }
            }

            for (var i in actions) configAction(actions[i])
        }

        sk.viewList = res.views
        
        configureActions(res.actions)
    }
}