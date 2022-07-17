
class ss_ui_complexity_comm {
    constructor(){
        ss.complexity.actions = {}

        this.send = (action, data)=>{
            return ss.comm.call('complexity', action, data)
        }
    }

    async init(){
        var res = await this.send('getComplexityInfo')


        var configureActions = actions => {
            var configAction = action => {
                ss.complexity.actions[action] = opt => { return this.send(action, opt) }
            }

            for (var i in actions) configAction(actions[i])
        }

        ss.viewList = res.views
        
        configureActions(res.actions)
    }
}