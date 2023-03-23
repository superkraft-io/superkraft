class sk_ui_canvas extends sk_ui_component {
    constructor(opt){
        super({...{htmlTag: 'canvas'}, ...opt})

        this.ctx = this.element.getContext('2d')

        this.configure()
    }

    configure(){
        var ratio = Math.ceil(window.devicePixelRatio)
        
        var w = parseInt(getComputedStyle(this.element).getPropertyValue('width'))
        var h = parseInt(getComputedStyle(this.element).getPropertyValue('height'))

        this.element.width = w * ratio
        this.element.height = h * ratio
        
        this.ctx.scale(ratio, ratio)
    }
    
}