class sk_ui_progressBar extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)

        //this.styling = 'middle'

        
    }

    init(){
        if (this.container) this.container.remove()
        this.container = this.add.component(_c => {
            _c.element.style.display = 'block'
            _c.element.style.width = '16px'
        })
    }
    
    get as(){
        this.init()
        return {
            circle: opt => {
                var defOpt = {duration: 200, color: 'grey', thickness: 8}
                defOpt = {...defOpt, ...opt}

                this.pB = new ProgressBar.Circle('.' + this.container.uuid, {
                    color: defOpt.color,
                    strokeWidth: defOpt.thickness,
                    duration: defOpt.duration
                })

                return this
            },

            line: opt => {
                this.style.overflow = 'hidden'
                
                var defOpt = {duration: 200, color: 'grey', thickness: 8}
                defOpt = {...defOpt, ...opt}

                this.pB = new ProgressBar.Line('.' + this.container.uuid, {
                    color: defOpt.color,
                    strokeWidth: defOpt.thickness,
                    duration: defOpt.duration
                })

                return this
            }
        }
    }

    set size(val){
        this.container.style.width = val + 'px'
    }

    set progress(val){
        this.pB.animate(1/100*val)
    }
}