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
                var defOpt = this.__defOpt || { duration: 200, color: 'grey', thickness: 8 }
                if (this.__color) defOpt.color = this.__color
                defOpt = { ...defOpt, ...opt }
                this.__defOpt = defOpt

                this.pB = new ProgressBar.Circle('.' + this.container.uuid, {
                    ...{
                        color: defOpt.color,
                        strokeWidth: defOpt.thickness,
                        duration: defOpt.duration
                    }, ...defOpt
                })

                if (this.__lastVal) this.pB.animate(1 / 100 * this.__lastVal)

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
                this.__pbType = 'bar'
                this.classAdd('sk_ui_progressBar_bar sk_ui_color_dark_grey')
                this.content = this.add.component(_c => {
                    _c.classAdd('sk_ui_progressBar_bar_content sk_ui_gradient_blue')
                    // Width tween is CSS on .sk_ui_progressBar_bar_content; keep generic size transition off.
                    _c.animate = false
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
        var next = Math.round(parseFloat(val))
        if (!Number.isFinite(next)) return
        if (next === this.__lastVal) return
        this.__lastVal = Math.max(0, Math.min(100, next))

        // Circle/line: ProgressBar.js. Bar: CSS width transition on .sk_ui_progressBar_bar_content.
        if (this.pB && typeof this.pB.animate === 'function') {
            this.pB.animate(this.__lastVal / 100)
            return
        }

        if (this.content) this.content.style.width = this.__lastVal + '%'
        if (this.contentHidden) this.contentHidden.style.width = this.__lastVal + '%'

        if (this.hintProgress && this.hintHandle) {
            this.hintHandle.hint({
                text: this.__lastVal + '%',
                instaShow: true,
                position: 'right center',
                hideOnMove: false
            })
        }
    }
}
