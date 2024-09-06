class SK_UMS {
    constructor(opt){
        this.events = {}
        this.clientIDCounter = -1

        if (sk.app_type !== 'wapp'){
            this.init_BE_events()
            wscb.on('sk_ums', (msg, rW)=>{
                if (msg.action === 'broadcast'){
                    this.broadcastToFrontend(msg.eventID, undefined, msg.data, true)
                }
            })
        }
    }

    async init_BE_events(){
        await sk.utils.sleep(2000)

        var res = await await sk.comm.main('get_UMS_BE_events')

        for (var eventName in res.events){
            var eventRes =  res.events[eventName]
            var eventObj = new SK_UMS_Event({id: eventRes.id})
            eventObj.data = eventRes.data
            if (!this.events[eventName]) this.events[eventName] = eventObj
        }
    }

    /**************/

    toBE(action, eventID, data){
        return new Promise(resolve => {
            var _data = data || {sk_ums_empty: true}
            _data = JSON.parse(JSON.stringify(_data))
            
            wscb.send({cmd: 'sk_ums', action: action, eventID: eventID, data: _data}, res => {
                resolve(res)
            })
        })
    }

    newID(){
        this.clientIDCounter++
        return this.clientIDCounter
    }

    on(eventID, client, cb){
        var existingEvent = this.events[eventID]
        if (!existingEvent) this.events[eventID] = new SK_UMS_Event({id: eventID})
        existingEvent = this.events[eventID]
        existingEvent.hook(client, res => { cb(res) })
    }

    off(eventID, client){
        var event = this.events[eventID]
        if (!event) return
        event.release(client)
        if (this.events[eventID] && this.events[eventID].length === 0) delete this.events[eventID]
    }

    broadcast(eventID, sender, data){
        this.broadcastToFrontend(eventID, sender, data)

        if (data.toBE !== false){
            if (sk.app_type !== 'wapp') this.broadcastToBackend(eventID, data)
        }
    }

    broadcastToFrontend(eventID, sender, data, fromBackend){
        var event = this.events[eventID]
        if (!event) return
        event.broadcast(sender, data, fromBackend)
    }

    broadcastToBackend(eventID, data){
        this.toBE('broadcast', eventID, data)
    }

    getdata(eventID){
        var event = this.events[eventID]
        if (!event) return
        return event.data
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

class SK_UMS_Event {
    constructor(opt){
        this.id = opt.id
        this.clients = []
        this.lastSender = undefined
    }

    setData(val){
        if (sk.app_type === 'wapp'){
            this.data = val
        } else {
            sk.ums.toBE('setEventData', this.id, val)
        }
    }

    getData(){
        return new Promise(async resolve => {
            var data = undefined

            if (sk.app_type === 'wapp'){
                data = this.data
            } else {
                var res = await sk.ums.toBE('getEventData', this.id)
                data = res.data
            }

            resolve(data)
        })
    }

    async hook(client, cb){
        this.clients.push({
            client: client,
            callback: res => { cb(res) }
        })

        var data = await this.getData()
        if (data !== undefined) cb({first: true, sender: this.lastSender, data: data})
    }

    release(client){
        for (var i = 0; i < this.clients.length; i++){
            var _client = this.clients[i]
            if (_client.id === client.id) return this.clients.splice(i,1)
        }
    }

    broadcast(sender, data, fromBackend){
        if (!fromBackend && data.toBE !== false) this.setData(data)
        this.lastSender = sender
        for (var i in this.clients){
            this.clients[i].callback({sender: sender, data: data})
        }
    }

    clearClientHooks(client){
        if (!client.id) return

        for (var i = this.clients.length - 1; i > -1; i--){
            var _client = this.clients[i].client
            if (_client.id === client.id){
                this.clients.splice(i, 1)
            }
        }
    }

    clearAllHooks(){
        this.clients = []
    }
}

class SK_UMS_Client {
    constructor(){
        this.id = sk.ums.newID()
    }

    clear(){
        sk.ums.clearClientHooks(this)
    }

    async on(eventID, cb){
        if (!cb) return console.error('No callback was defined for event ' + eventID)
        sk.ums.on(eventID, this, res => {
            cb(res)
        })
    }

    off(eventID){
        sk.ums.off(eventID, this)
    }

    get(eventID){
        return sk.ums.getData(eventID)
    }

    set(eventID, data){
        sk.ums.broadcast(eventID, this, data)
    }
}
