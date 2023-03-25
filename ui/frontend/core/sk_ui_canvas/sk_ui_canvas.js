class sk_ui_canvas extends sk_ui_component {
    constructor(opt){
        super({...{htmlTag: 'canvas'}, ...opt})

        this.ctx = this.element.getContext('2d')

        this.ratio = Math.ceil(window.devicePixelRatio)

        const resizeObserver = new ResizeObserver(()=> this.update() )
        resizeObserver.observe(this.element)

        this.color = 'white'

        this.update()
    }

    update(){
        var w = Math.ceil(this.rect.width * this.ratio)
        var h = Math.ceil(this.rect.height * this.ratio)
        
        this.element.width = w
        this.element.height = h

        //this.ctx.scale(this.ratio, this.ratio) //no need to set scale apparently

        if (this.onResize) this.onResize()
    }
    
    clear(opt){
        this.ctx.clearRect(0, 0, this.element.width, this.element.height)
    }

    fillRect(opt){
        this.tmpClr = this.color
        this.ctx.fillStyle = opt.color || this.tmpClr
        this.ctx.fillRect(opt.left * this.ratio, opt.top * this.ratio, opt.width * this.ratio, opt.height * this.ratio)
        this.ctx.fillStyle = this.tmpClr
    }

    text(opt){
        var defFont = {
            ...{
                size: 14,
                name: 'verdana',
                family: 'sans-serif'
            },

            ...opt.font
        }

        var fontStr = `${defFont.size * this.ratio}px ${defFont.name}, ${defFont.family}`


        this.tmpClr = this.color
        this.ctx.font = fontStr
        this.ctx.textBaseline = opt.baseline ||'hanging'
        this.ctx.textAlign = opt.alignment || 'start'
        this.ctx.fillText(opt.text || 'Text', opt.left * this.ratio || 0, opt.top * this.ratio || 0)
        this.ctx.fillStyle = this.tmpClr
    }
}