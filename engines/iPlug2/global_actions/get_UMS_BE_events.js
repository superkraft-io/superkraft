module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, view, _v){
        var events = {}

        for (var name in sk.ums.events){
            var event = sk.ums.events[name]
            events[name] = {id: event.id, data: event.data}
        }

        res.resolve({events: events})
    }
}