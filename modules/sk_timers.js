module.exports = class SK_Timers {
    constructor(){
        this.id = 0
        this.list = {}

        this.init()
    }

    init(){
        this.originals = {
            clear: {
                immediate: clearImmediate,
                timeout: clearTimeout,
                interval: clearInterval
            },

            set: {
                immediate: setImmediate,
                timeout: setTimeout,
                interval: setInterval
            }
        }

        
        global.clearImmediate = timer => { this.destroy('immediate', timer) }
        global.setImmediate = (cb, delay)=>{ this.create('immediate', cb, delay) }

        global.clearTimeout = timer => { this.destroy('timeout', timer) }
        global.setTimeout = (cb, delay)=>{ return this.create('timeout', cb, delay) }

        global.clearInterval = timer => { this.destroy('timeout', timer) }
        global.setInterval = (cb, delay)=>{ return this.create('interval', cb, delay) }
    }

    destroy(type, timer){
        if (!timer) return this.originals.clear[type](timer)
        if (!timer.opt) return this.originals.clear[type](timer)
        
        delete this.list[timer.opt.id]
        this.originals.clear[timer.opt.type](timer.timer)
    }

    create(type, cb, delay){
        this.id++
        this.list[this.id] = new SK_Timer({parent: this, id: this.id, type: type, cb: cb, delay: delay})
        return this.list[this.id]
    }

    destroyAll(){
        for (var i in this.list){
            var timer = this.list[i]
            timer.destroy()
        }
    }
}

class SK_Timer {
    constructor(opt){
        this.opt = opt

        this.create()
    }

    destroy(){
        this.opt.parent.destroy(this.opt.type, this)
    }

    create(){
        this.timer = this.opt.parent.originals.set[this.opt.type](()=>{ this.opt.cb() }, this.opt.delay)
    }
}