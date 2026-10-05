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

        
        // Extra arguments are passed on to the callback, as Node's timers do.
        global.clearImmediate = timer => { this.destroy('immediate', timer) }
        global.setImmediate = (cb, ...args)=>{ return this.create('immediate', cb, undefined, args) }

        global.clearTimeout = timer => { this.destroy('timeout', timer) }
        global.setTimeout = (cb, delay, ...args)=>{ return this.create('timeout', cb, delay, args) }

        global.clearInterval = timer => { this.destroy('timeout', timer) }
        global.setInterval = (cb, delay, ...args)=>{ return this.create('interval', cb, delay, args) }
    }

    destroy(type, timer){
        if (!timer) return this.originals.clear[type](timer)
        if (!timer.opt) return this.originals.clear[type](timer)
        
        delete this.list[timer.opt.id]
        this.originals.clear[timer.opt.type](timer.timer)
    }

    create(type, cb, delay, args){
        this.id++
        this.list[this.id] = new SK_Timer({parent: this, id: this.id, type: type, cb: cb, delay: delay, args: args || []})
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
        try {
            var run = ()=>{
                // A finished timeout or immediate leaves the list.
                if (this.opt.type !== 'interval') delete this.opt.parent.list[this.opt.id]
                this.opt.cb(...this.opt.args)
            }
            this.timer = this.opt.type === 'immediate'
                ? this.opt.parent.originals.set.immediate(run)
                : this.opt.parent.originals.set[this.opt.type](run, this.opt.delay)
        } catch(err) {
            var x = 0
        }
    }

    // Node's Timeout methods, which libraries call (e.g. unref() so a timer doesn't keep the process alive).
    unref(){
        if (this.timer && this.timer.unref) this.timer.unref()
        return this
    }

    ref(){
        if (this.timer && this.timer.ref) this.timer.ref()
        return this
    }

    hasRef(){
        return !!(this.timer && this.timer.hasRef && this.timer.hasRef())
    }

    refresh(){
        if (this.timer && this.timer.refresh) this.timer.refresh()
        return this
    }

    [Symbol.toPrimitive](){
        return this.opt.id
    }
}