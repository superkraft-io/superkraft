class sk_ui_progressBar extends sk_ui_component {
    constructor(opt){
        super(opt)

        //this.styling = 'middle'

        
    }

    init(){
        if (this.container) this.container.remove()
        this.container = this.add.component(_c => {
            _c.animate = false
            _c.element.style.display = 'block'
            _c.element.style.width = '16px'
        })
    }
    
    get as(){
        this.init()
        return {
            circle: opt => {
                this.__pbType = 'circle'
                var defOpt = {duration: 200, color: 'grey', thickness: 8}
                defOpt = { ...defOpt, ...opt }
                this.__defOpt = defOpt

                this.pB = new ProgressBar.Circle('.' + this.container.uuid, {
                    ...{
                        color: defOpt.color,
                        strokeWidth: defOpt.thickness,
                        duration: defOpt.duration
                    }, ...defOpt
                })

                return this
            },

            line: opt => {
                this.__pbType = 'line'
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
                this.compact = true
                this.vertical = false
                this.classAdd('sk_ui_progressBar_bar sk_ui_color_dark_grey')
                this.content = this.add.component(_c => {
                    _c.classAdd('sk_ui_progressBar_bar_content sk_ui_gradient_blue')
                    
                })

                this.contentHidden = this.add.component(_c => {
                    _c.classAdd('sk_ui_progressBar_bar_content')
                    _c.opacity = 0.01
                    _c.animate = false
                    this.hintHandle = _c.add.component(_c => {
                        _c.classAdd('sk_ui_progressBar_hintHandle')
                    })
                })
                
                
                return this
            }
        }
    }

    set size(val) {
        this.__size = val
        this.container.style.width = val + 'px'
    }

    set color(val) {
        if (val === this.__color) return

        this.__color = val

        if (this.pB) {
            this.as[this.__pbType]({
                ...this.__defOpt,
                ...{color: val}
            })
            this.size = this.__size
        }
    }

    set progress(val){
        try {
            this.pB.animate(1/100*val)
        } catch(err) {
            this.content.style.width = val + '%'
            this.contentHidden.style.width = val + '%'
            if (this.hintProgress) this.hintHandle.hint({text: val + '%', instaShow: true, position: 'right center', hideOnMove: false})
        }
    }
}