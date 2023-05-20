class SK_WebWorker {
    constructor(opt){
        this.parent = opt.parent

        this.ww = new Worker(opt.wwModulePath)
        this.ww.onmessage = _e => { handleMsg(_e) }
        
        this.uuidIndex = 0
        this.callList = {}
        this.value_list
    
        var handleMsg = _e => {
            var data = _e.data
            var cmd = data.cmd

            //if (_e.data.cmd === 'mirror')

            var resrej = this.callList[_e.data.uuid]
            resrej.res(_e.data)
        }

        
    }

    newUUID = ()=>{
        this.uuidIndex++
        while (this.callList[this.uuidIndex]){ this.uuidIndex++ }
        return this.uuidIndex
    }

    send(command, data, oneShot){
        return new Promise(async (resolve, reject)=>{
            if (!oneShot){
                var uuid = this.newUUID()
                this.callList[uuid] = {res: resolve, rej: reject}
            }

            var _data = {}

            for (var key in data){
                var val = data[key]
                if (val instanceof Function){
                    //console.error(key + ' is not valid data type')
                } else {
                    _data[key] = val
                }
            }

            try {
                this.ww.postMessage({
                    uuid: uuid,
                    oneShot: oneShot,
                    cmd: command,
                    data: _data
                })
            } catch(err) {
                var x = 0
            }
        })
    }


    waitForValue(uuid){
        var value = this.value_list[uuid]

        while (!value){
            value = this.value_list[uuid]
        }

        return value
    }


    async init(opt){
        var res = await this.send('init', opt)
        
        this.configure(res)
    }

    async configure(opt){
        var info = opt.info

        for (var key in info){
            var val = info[key]
            
            if (val.variable) this.add_var(key, val)
            if (val.set || val.get) this.add_set_get(key, val)
            if (val.function) this.add_func(key, val)
        }

        if (this.parent.onSKThreadReady) this.parent.onSKThreadReady()
    }

    add_var(name, info){
        this.parent[name] = info.value
    }

    add_set_get(name, info){
        var opt = {}

        if (info.set) opt.set = val => { this.send({cmd: 'setPropertyValue', data: val}) }
        if (info.get) opt.get = ()=>{
            return this.parent['__' + name]
        }


        Object.defineProperty(this, name, opt)
    }

    add_func(name, info){
        var _this = this

        if (info.function === 'async'){
            this.parent[name] = async function(){
                return new Promise(async (resolve, reject)=>{
                    var args = []
        
                    for (var i = 0; i < arguments.length; i++){
                        args.push(arguments[i])
                    }
                    
                    var res = await _this.send('callFunc', {func: name, async: true, args: args})
                    if (res.data.error){
                        return
                        if (reject) return reject(res.data.error)
                        else throw res.data.error
                    }
                    resolve(res.data)
                })
            }
        } else {
            this.parent[name] = function (){
                var args = []
        
                for (var i = 0; i < arguments.length; i++){
                    args.push(arguments[i])
                }
                
                var uuid = _this.send('callFunc', {func: name, args: args}, false, true)
                return _this.waitForValue(uuid)
            }
        }
    }
}



class SK_Thread {
    constructor(opt, wwModulePath){
        this.__ww__ = new SK_WebWorker({
            parent: this,
            wwModulePath: wwModulePath
        })

        this.__ww__.init(opt)
    }    
}