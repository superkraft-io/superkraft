class SK_Subscriptions {
    constructor(opt){
        this.events = {}
        this.clientIDCounter = -1
    }

    newID(){
        this.clientIDCounter++
        return this.clientIDCounter
    }

    on(eventID, client, cb){
        var existingEvent = this.events[eventID]
        if (!existingEvent) this.events[eventID] = new SK_Subscription_Event({id: eventID})
        existingEvent = this.events[eventID]
        existingEvent.hook(client, (sender, val)=>{ cb(sender, val) })
    }

    off(eventID, client){
        var event = this.events[eventID]
        if (!event) return
        event.release(client)
        if (this.events[eventID] && this.events[eventID].length === 0) delete this.events[eventID]
    }

    broadcast(eventID, sender, value){
        var event = this.events[eventID]
        if (!event) return
        event.broadcast(sender, value)
    }

    getValue(eventID){
        var event = this.events[eventID]
        if (!event) return
        return event.value
    }

    clearClientHooks(client){
        for (var eventID in this.events){
            var event = this.events[eventID]
            event.clearClientHooks(client)
        }
    }

    clearEvent(eventID){
        var event = this.events[eventID]
        if (!event) return
        event.clearAllHooks()
        delete this.events[eventID]
    }
}

class SK_Subscription_Event {
    constructor(opt){
        this.id = opt.id
        this.clients = []
        this.lastSender = undefined
        this.value = undefined
    }

    hook(client, cb){
        this.clients.push({
            client: client,
            callback: (sender, value)=>{ cb(sender, value) }
        })

        if (this.value) cb(this.lastSender, this.value)
    }

    release(client){
        for (var i = 0; i < this.clients.length; i++){
            var _client = this.clients[i]
            if (_client.id === client.id) return this.clients.splice(i,1)
        }
    }

    broadcast(client, value){
        this.value = value
        this.lastSender = client
        for (var i in this.clients) this.clients[i].callback(client, value)
    }

    clearClientHooks(client){
        for (var i = this.clients.length - 1; i > -1; i--){
            var _client = this.clients[i].client
            if (_client.id === client.id) this.clients.splice(i, 1)
        }
    }

    clearAllHooks(){
        this.clients = []
    }
}

class SK_Subscription_Client {
    constructor(){
        this.id = sk.subscriptions.newID()
    }

    clear(){
        sk.subscriptions.clearClientHooks(this)
    }

    on(eventID, cb){
        if (!cb) return console.error('No callback was defined for event ' + eventID)
        sk.subscriptions.on(eventID, this, (sender, val) => {
            cb(sender, val)
        })
    }

    off(eventID){
        sk.subscriptions.off(eventID, this)
    }

    get(eventID){
        return sk.subscriptions.getValue(eventID)
    }

    set(eventID, value){
        var event = sk.subscriptions.broadcast(eventID, this, value)
    }
}