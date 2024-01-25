class sk_ui_canvas extends sk_ui_component {
    constructor(opt){
        super({...{htmlTag: 'canvas'}, ...opt})

        this.ctx = this.element.getContext('2d', {willReadFrequently: true})
        this.ctx.lineWidth = 1

        this.ratio = Math.ceil(window.devicePixelRatio)

        const resizeObserver = new ResizeObserver(()=>{
            if (!this.manualUpdate) this.update()
            if (this.onResize) this.onResize()
        })
        resizeObserver.observe(this.element)

        this.color = 'white'

        this.update()
    }

    update(){
        var w = Math.ceil(this.rect.width * this.ratio)
        var h = Math.ceil(this.rect.height * this.ratio)
        
        this.element.width = w
        this.element.height = h
    }
    
    clear(){
        this.ctx.clearRect(0, 0, this.rect.width, this.rect.height)
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
                family: 'sans-serif',
                color: 'white',
            },

            ...opt.font
        }

        var fontStr = `${defFont.size * this.ratio}px ${defFont.name}, ${defFont.family}`

        opt.left += 0.5
        opt.top += 0.5

        this.tmpClr = this.ctx.fillStyle
        this.ctx.font = fontStr
        this.ctx.textBaseline = opt.baseline || 'hanging'
        this.ctx.textAlign = opt.alignment || 'start'
        this.ctx.fillStyle = defFont.color
        this.ctx.fillText((opt.text !== undefined ? opt.text : 'Text'), opt.left * this.ratio || 0, opt.top * this.ratio || 0)
        this.ctx.fillStyle = this.tmpClr
    }

    line(opt){
        this.tmpClr = this.color
        this.ctx.strokeStyle = opt.color || this.tmpClr

        this.ctx.beginPath()
        this.ctx.moveTo(opt.from.x * this.ratio + 0.5, opt.from.y * this.ratio + 0.5)
        this.ctx.lineTo(opt.to.x * this.ratio + 0.5, opt.to.y * this.ratio + 0.5)
        this.ctx.stroke()

        this.ctx.strokeStyle = this.tmpClr
    }

    pixel(opt){
        this.tmpClr = this.color
        this.ctx.strokeStyle = opt.color || this.tmpClr

        
        this.fillRect({left: opt.left + 0.5, top: opt.top + 0.5, width: 1, height: 1, color: opt.color})

        this.ctx.strokeStyle = this.tmpClr
    }

    measureText(opt){
        var defFont = {
            ...{
                size: 14,
                name: 'verdana',
                family: 'sans-serif',
                color: 'white',
            },

            ...opt.font
        }

        var fontStr = `${defFont.size * this.ratio}px ${defFont.name}, ${defFont.family}`

        this.ctx.font = fontStr
        return this.ctx.measureText(opt.text)
    }
}