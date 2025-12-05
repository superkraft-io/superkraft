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

        //sk.ums.broadcast('sk_ui_tween_step', undefined, {toBE: false})
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
        this._steps   = 0
        this.speed   = opt.speed || 25

        this.backOvershoot = 1.70158
        this.elasticPeriod = 0.3
        this.power = 20
        this.steps = 3
        


        sk.tweens.tween_id_counter++
        this.id = sk.tweens.tween_id_counter

        if (!opt.decoupled) sk.tweens.list.push(this)


        this.manualStepping = opt.manualStepping

        this.easing = opt.easing || 'outElastic'

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

    static get easings() {
        return {
            // Linear
            linear(t, b, c, d) { return c * t / d + b; },

            // Quadratic
            inQuad(t, b, c, d) { t /= d; return c * t * t + b; },
            outQuad(t, b, c, d) { t /= d; return -c * t * (t - 2) + b; },
            inOutQuad(t, b, c, d) { t /= d/2; return t<1 ? c/2*t*t + b : -c/2*(--t*(t-2)-1)+b; },

            // Cubic
            inCubic(t, b, c, d) { t /= d; return c*t*t*t + b; },
            outCubic(t, b, c, d) { t = t/d-1; return c*(t*t*t + 1) + b; },
            inOutCubic(t, b, c, d) { t /= d/2; return t<1 ? c/2*t*t*t + b : c/2*((t-=2)*t*t +2)+b; },

            // Quartic
            inQuart(t, b, c, d) { t /= d; return c*t*t*t*t + b; },
            outQuart(t, b, c, d) { t = t/d-1; return -c*(t*t*t*t -1) + b; },
            inOutQuart(t, b, c, d) { t /= d/2; return t<1 ? c/2*t*t*t*t + b : -c/2*((t-=2)*t*t*t -2)+b; },

            // Quintic
            inQuint(t, b, c, d) { t /= d; return c*t*t*t*t*t + b; },
            outQuint(t, b, c, d) { t = t/d-1; return c*(t*t*t*t*t + 1) + b; },
            inOutQuint(t, b, c, d) { t /= d/2; return t<1 ? c/2*t*t*t*t*t + b : c/2*((t-=2)*t*t*t*t +2)+b; },

            // Sinusoidal
            inSine(t, b, c, d) { return -c * Math.cos(t/d * (Math.PI/2)) + c + b; },
            outSine(t, b, c, d) { return c * Math.sin(t/d * (Math.PI/2)) + b; },
            inOutSine(t, b, c, d) { return -c/2*(Math.cos(Math.PI*t/d)-1)+b; },

            // Exponential
            inExpo(t, b, c, d) { return t===0 ? b : c * Math.pow(2,10*(t/d-1)) + b; },
            outExpo(t, b, c, d) { return t===d ? b+c : c * (-Math.pow(2,-10*t/d) +1) + b; },
            inOutExpo(t, b, c, d) { if(t===0) return b; if(t===d) return b+c; t/=d/2; if(t<1) return c/2*Math.pow(2,10*(t-1))+b; return c/2*(-Math.pow(2,-10*--t)+2)+b; },

            // Circular
            inCirc(t, b, c, d) { t /= d; return -c*(Math.sqrt(1 - t*t) -1) + b; },
            outCirc(t, b, c, d) { t = t/d-1; return c*Math.sqrt(1 - t*t) + b; },
            inOutCirc(t, b, c, d) { t /= d/2; if(t<1) return -c/2*(Math.sqrt(1-t*t)-1)+b; t-=2; return c/2*(Math.sqrt(1-t*t)+1)+b; },

            // Back (overshoot)
            inBack(t, b, c, d) { 
                const s = this.backOvershoot ?? 1.70158;
                t /= d; return c*t*t*((s+1)*t - s) + b; 
            },
            outBack(t, b, c, d) { 
                const s = this.backOvershoot ?? 1.70158;
                t = t/d-1; return c*(t*t*((s+1)*t + s) +1) + b; 
            },
            inOutBack(t, b, c, d) { 
                const s = (this.backOvershoot ?? 1.70158)*1.525; 
                t /= d/2; 
                if(t<1) return c/2*(t*t*((s+1)*t - s)) + b; 
                t-=2; 
                return c/2*(t*t*((s+1)*t + s)+2) + b; 
            },

            // Elastic (springy)
            inElastic(t, b, c, d) {
                const a = this.elasticAmplitude ?? c;
                const p = this.elasticPeriod ?? d*0.3;
                if(t===0) return b; 
                if((t/=d)===1) return b+c;
                const s = p/(2*Math.PI)*Math.asin(c/a);
                return -(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)) + b;
            },
            outElastic(t, b, c, d) {
                const a = this.elasticAmplitude ?? c;
                const p = this.elasticPeriod ?? d*0.3;
                if(t===0) return b; 
                if((t/=d)===1) return b+c;
                const s = p/(2*Math.PI)*Math.asin(c/a);
                return a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p) + c + b;
            },
            inOutElastic(t, b, c, d) {
                const a = this.elasticAmplitude ?? c;
                const p = this.elasticPeriod ?? d*0.45;
                if(t===0) return b; 
                if((t/=d/2)===2) return b+c;
                const s = p/(2*Math.PI)*Math.asin(c/a);
                if(t<1) return -0.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)) + b;
                return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)*0.5 + c + b;
            },

            // Bounce
            inBounce(t, b, c, d) { return c - this.outBounce(d-t,0,c,d) + b; },
            outBounce(t, b, c, d) {
                t /= d;
                if(t < 1/2.75) return c*(7.5625*t*t)+b;
                else if(t < 2/2.75) return c*(7.5625*(t-=1.5/2.75)*t + .75)+b;
                else if(t < 2.5/2.75) return c*(7.5625*(t-=2.25/2.75)*t + .9375)+b;
                else return c*(7.5625*(t-=2.625/2.75)*t + .984375)+b;
            },
            inOutBounce(t, b, c, d) {
                if(t < d/2) return this.inBounce(t*2,0,c,d)*0.5 + b;
                else return this.outBounce(t*2-d,0,c,d)*0.5 + c*0.5 + b;
            },

            // Polynomial power (using this.pow)
            inPow(t, b, c, d) { const p = this.power ?? 2; t/=d; return c*Math.pow(t,p)+b; },
            outPow(t, b, c, d) {
                const p = this.power ?? 2;
                t=t/d-1;
                return c*(1 - Math.pow(-t,p))+b;
            },
            outPow(t, b, c, d) { const p = this.power ?? 2; t/=d/2; if(t<1) return c/2*Math.pow(t,p)+b; t-=2; return c/2*(2 - Math.pow(-t,p))+b; },

            // Step (discrete steps, using this.steps)
            step(t, b, c, d) { const steps = this.steps ?? 5; return b + c * Math.floor(t/d*steps)/steps; }
        }
    }


    

    step(opt = {}){
        

        if (this.manualStepping && opt.fromGlobalStepper) return

        if (this._steps === 0) return
        

        if (this.tag === 'zoomY'){
            var x = 0
        }


        if (this.speed === 'instant') this._steps = 0
        else this._steps -= sk.tweens.globalSpeed || this.speed
        
        if (this._steps < 0) this._steps = 0

        var step = (1000 - this._steps) / 1000
        
        var easingFunc = SK_Tween.easings[this.easing]
        if (!easingFunc){
            //check if function is a string or a function
            if (typeof this.easing === 'function'){
                easingFunc = this.easing
            } else {
                throw new Error('Easing function not found: ' + this.easing)
            }
        }

        this.current = easingFunc.call(this, step, this.last, this.target - this.last, 1)


        this.onChanged(this)

        if (this.current === this.target) this.stop()
    }

    async to(val){
        if (val === this.current) return
        this.last = this.current
        this._steps = 1000
        this.target = val

        /*
        await this.stopStepping()
        if (this.autoStep) this.startAutoStepper()
        */

        //this.__running = true
    }

    async stop(){
        this.target  = this.current
        this._steps   = 0
        this.last    = this.current

        //await this.stopStepping()
    }
}