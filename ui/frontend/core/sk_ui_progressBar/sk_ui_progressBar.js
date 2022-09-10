class sk_ui_progressBar extends sk_ui_component {
    constructor(opt){
        super(opt)

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
            },

            bar: opt => {
                this.classAdd('sk_ui_progressBar_bar sk_ui_color_dark_grey')
                this.content = this.add.component(_c => {
                    _c.classAdd('sk_ui_progressBar_bar_content sk_ui_gradient_blue')
                })
                
                return this
            }
        }
    }

    set size(val){
        this.container.style.width = val + 'px'
    }

    set progress(val){
        try {
            this.pB.animate(1/100*val)
        } catch(err) {
            this.content.style.width = val + '%'
        }
    }
}