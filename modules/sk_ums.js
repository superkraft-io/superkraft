module.exports = class SK_UMS {
    constructor(opt){
        this.events = {}
        this.clientIDCounter = -1


        opt.app.whenReady().then(() => {
            global.sk.wscb.on('sk_ums', (msg, rW)=>{
                if (msg.action === 'newID'){
                    rW({id: this.newID()})
                }
                
                if (msg.action === 'broadcast'){
                    this.handleFromFrontend(msg.eventID, msg.data)
                }


                if (msg.action === 'setEventData'){
                    var event = this.addOrGet(msg.eventID)
                    event.data = msg.data
                }

                if (msg.action === 'getEventData'){
                    var data = undefined
                    var event = this.events[msg.eventID]
                    if (event) data = event.data
                    rW({data: data})
                }
            })
        })
    }

    toFE(action, eventID, data){
        return new Promise(resolve => {
            sk.wscb.send({cmd: 'sk_ums', action: action, eventID: eventID, data: data}, res => {
                resolve(res)
            })
        })
    }

    newID(){
        this.clientIDCounter++
        return this.clientIDCounter
    }

    handleFromFrontend(eventID, data){
        this.broadcastToBackend(eventID, data)
    }

    broadcast(eventID, data){
        this.broadcastToBackend(eventID, data)
        this.broadcastToFrontend(eventID, data)
    }

    broadcastToBackend(eventID, data){
        var event = this.addOrGet(eventID)
        event.broadcast(data)
    }

    broadcastToFrontend(eventID, data){
        if (data.fromFrontend){
            var x = 0
        }
        this.toFE('broadcast', eventID, data)
    }

    addOrGet(eventID){
        if (!this.events[eventID]) this.events[eventID] = new SK_UMS_Event({id: eventID})
        return this.events[eventID]
    }
    on(eventID, cb){
        var existingEvent = this.addOrGet(eventID)
        existingEvent.hook((sender, val)=>{ cb(sender, val) })
    }

    /*off(eventID, client){
        var event = this.events[eventID]
        if (!event) return
        event.release(client)
        if (this.events[eventID] && this.events[eventID].length === 0) delete this.events[eventID]
    }*/
}

class SK_UMS_Event {
    constructor(opt){
        this.id = opt.id
        this.hooks = []
        this.lastSender = undefined
        this.data = undefined
    }

    getDataFromFrontend(){
        return new Promise(async resolve => {
            var res = await sk.ums.toFE('getDataOfEvent', this.id)
            resolve(res.data)
        })
    }

    async hook(cb){
        this.hooks.push((sender, data)=>{ cb(sender, data) })

        if (this.data !== undefined) cb(this.lastSender, this.data)
    }

    release(client){
        for (var i = 0; i < this.clients.length; i++){
            var _client = this.clients[i]
            if (_client.id === client.id) return this.clients.splice(i,1)
        }
    }

    broadcast(data){
        this.data = data
        //this.lastSender = client
        for (var i in this.hooks){
            this.hooks[i]({data: data})
        }
    }
/*
    clearClientHooks(client){
        for (var i = this.clients.length - 1; i > -1; i--){
            var _client = this.clients[i].client
            if (_client.id === client.id) this.clients.splice(i, 1)
        }
    }

    clearAllHooks(){
        this.clients = []
    }*/
}