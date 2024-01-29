class SK_UI_Tweens {
    constructor(){
        this.tween_id_counter = 0
        this.list = []
        //this.globalSpeed = 25

        this.start()
    }

    step(){
        for (var i in this.list){
            var tween = this.list[i]
            tween.step({fromGlobalStepper: true})
        }

        sk.ums.broadcast('sk_ui_tween_step', undefined, {})
    }

    start(){
        this.__running = true
        var step = async _ts => {
            if (this.__stopStepping) return this.__running = false
            try { this.step() } catch(err) {}
            window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)
    }

    stop(){
        this.__stopStepping = true
    }
}

class SK_Tween {
    constructor(opt){
        this.tag = opt.tag
        this.onChanged = opt.onChanged

        this.target  = 0
        this.last    = 0
        this.current = 0
        this.steps   = 0
        this.speed   = opt.speed || 25

        sk.tweens.tween_id_counter++
        this.id = sk.tweens.tween_id_counter

        if (!opt.decoupled) sk.tweens.list.push(this)


        this.manualStepping = opt.manualStepping

        //this.autoStep = opt.autoStep
        //if (opt.autoStep) this.startAutoStepper()
    }

    /*
    startAutoStepper(){
        var step = async _ts => {
            if (this.__stopStepping) return this.__running = false
            this.step()
            window.requestAnimationFrame(step)
        }
        window.requestAnimationFrame(step)
    }

    stopStepping(){
        return new Promise(resolve => {
            this.__stopStepping = true

            var timer = setInterval(()=>{
                if (this.__running) return
                this.__stopStepping = false
                clearInterval(timer)
                resolve()
            }, 1)
        })
    }
    */

    easeOutQuint(t, b, c, d){ return c * ((t = t / d - 1) * t * t * t * t + 1) + b; }

    step(opt = {}){
        

        if (this.manualStepping && opt.fromGlobalStepper) return

        if (this.steps === 0) return
        

        if (this.tag === 'zoomY'){
            var x = 0
        }


        if (this.speed === 'instant') this.steps = 0
        else this.steps -= sk.tweens.globalSpeed || this.speed
        
        if (this.steps < 0) this.steps = 0

        var step = (1000 - this.steps) / 1000
        this.current = this.easeOutQuint(
            step,
            this.last,
            this.target - this.last,
            1
        )


        this.onChanged(this)

        if (this.current === this.target) this.stop()
    }

    async to(val){
        if (val === this.current) return
        this.last = this.current
        this.steps = 1000
        this.target = val

        /*
        await this.stopStepping()
        if (this.autoStep) this.startAutoStepper()
        */

        //this.__running = true
    }

    async stop(){
        this.target  = this.current
        this.steps   = 0
        this.last    = this.current

        //await this.stopStepping()
    }
}