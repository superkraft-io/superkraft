class sk_repeater {
    constructor(opt){
        this.again = true
        this.timer = setInterval(()=>{
            if (!this.again) return
            this.again = false
            opt.onFire(()=>{ this.again = true })
        }, opt.delay || 1000)
    }

    stop(){
        clearInterval(this.timer)
    }
}