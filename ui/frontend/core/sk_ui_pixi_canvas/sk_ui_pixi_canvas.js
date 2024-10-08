class sk_ui_pixi_canvas extends sk_ui_component {
    constructor(opt){
        super({...opt, htmlTag: 'canvas'})
    }

    async init(){
        var rect = this.rect

        this.pixiApp = new PIXI.Application()
        await this.pixiApp.init({
            view: this.element,
            transparent: true,
            resizeTo: this.element,
            width: rect.width,
            height: rect.height,
            antialias: true,
            resolution: window.devicePixelRatio,
            backgroundColor: 'transparent'
        })

        //this.pxG = new PIXI.Graphics()
        //this.pixiApp.stage.addChild(this.pxG)

        this.pixiApp.stage.sortableChildren = true;

        
        this.ctx = new sk_ui_pixi_canvas_ctx(this)

        var _resizeObserver = new ResizeObserver(_e => {
            if (this.onResized) this.onResized()
        })

        _resizeObserver.observe(this.element)
    }

    onBeforeRemove(){
        this.pixiApp.destroy()
    }

    update(){}

    clear(){
        //this.pxG.clear()
    }

    fillRect(opt){
        this.tmpClr = this.color
        this.ctx.fillStyle = opt.color || this.tmpClr
        this.ctx.fillRect(opt.left * this.ratio, opt.top * this.ratio, opt.width * this.ratio, opt.height * this.ratio)
        this.ctx.fillStyle = this.tmpClr
    }

    text(opt){
        return
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
        this.ctx.moveTo(opt.from.x * this.ratio, opt.from.y * this.ratio)
        this.ctx.lineTo(opt.to.x * this.ratio, opt.to.y * this.ratio)
        this.ctx.stroke()

        this.ctx.strokeStyle = this.tmpClr
    }

    pixel(opt){
        this.tmpClr = this.color
        this.ctx.strokeStyle = opt.color || this.tmpClr

        
        this.fillRect({left: opt.left, top: opt.top, width: 1, height: 1, color: opt.color})

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

class sk_ui_pixi_canvas_ctx {
    constructor(parent){
        this.parent = parent
        this.pxG = this.parent.pxG

        this.__strokeColor = 'black'
        this.__lineWidth = 1
    }

    set strokeStyle(val){
        this.__strokeColor = val
        this.pxG.lineStyle(this.__lineWidth, val)
    }

    get strokeStyle(){ return this.__strokeColor }

    set lineWidth(val){
        this.__lineWidth = val
        this.pxG.lineStyle(val, this.__strokeColor)
    }

    get lineWidth(){ return this.__lineWidth }

    
    set font(val){ }

    setLineDash(opt){

    }

    beginPath(){
        //this.points = [{x: x, y: y, color: this.__strokeColor, width: this.__lineWidth}]
    }

    closePath(){
        this.pxG.closePath()
    }

    stroke(){

    }

    moveTo(x, y){
        this.pxG.moveTo(x, y)
    }

    lineTo(x, y){
        this.pxG.lineTo(x, y)
        //this.points.push({x: x, y: y, color: this.__strokeColor, width: this.__lineWidth})

        //this.update()
    }

    measureText(){
        return {width: 32}
    }
}