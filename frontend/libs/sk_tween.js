window.tweens = {
    list: [],
    step: ()=>{
        for (var i in window.tweens.list){
            var tween = window.tweens.list[i]
            tween.step()
        }
    }
}

class sk_tween {
    constructor(opt){
        this.tag = opt.tag
        this.onChanged = opt.onChanged

        this.target  = 0
        this.last    = 0
        this.current = 0
        this.steps   = 0
        this.speed   = opt.speed || 25

        

        this.id = 0
        for (var i in window.tweens.list){
            var tween = window.tweens.list[i]
            if (tween.id > this.id) this.id = tween.id + 1
        }

        if (!opt.decoupled) window.tweens.list.push(this)
    }

    easeOutQuint(t, b, c, d){ return c * ((t = t / d - 1) * t * t * t * t + 1) + b; }

    step(){
        if (this.steps === 0) return
        
        if (this.speed === 'instant') this.steps = 0
        else this.steps -= this.speed
        
        if (this.steps < 0) this.steps = 0

        var step = (1000 - this.steps) / 1000
        this.current = this.easeOutQuint(
            step,
            this.last,
            this.target - this.last,
            1
        )

        this.onChanged(this)
    }

    to(val){
        if (val === this.current) return
        this.last = this.current
        this.steps = 1000
        this.target = val
    }

    stop(){
        this.target  = this.current
        this.steps   = 0
        this.last    = this.current
        console.log('============= stopped')
    }
}