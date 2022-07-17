class sk_ui_checkmark extends sk_ui_component {
    constructor(parent){
        super(parent)

        var tree = {
            div_loader: { class: 'sk_ui_checkmark_circle-loader',
                div_check: { class: 'sk_ui_checkmark-check draw' }
            }
        }

        this.checkmarkBucket = JSOM.parse({root: this.element, tree: tree})

        this.style.overflow = 'hidden'

        this.attributes.add({
            friendlyName: 'Size',
            name: 'size',
            type: 'number',
            onSet: val => {
                this.width = val
                this.height = val

                var standardSize = 98
                var ratio = val/standardSize
                this.checkmarkBucket.loader.style.transform = `scale(${ratio})`
                this.checkmarkBucket.check.style.transform = `scale(${ratio})`

                this.checkmarkBucket.loader.style.width = val + 'px'
                this.checkmarkBucket.loader.style.height = val + 'px'
            }
        })
    }

    check(){
        this.checked = true
        
        
        //this.checkmarkBucket.loader.style.borderColor      = this.__color
        //this.checkmarkBucket.check.style.borderRightColor  = this.__color
        //this.checkmarkBucket.check.style.borderTopColor    = this.__color

        this.checkmarkBucket.loader.classList.add('sk_ui_checkmark_load-complete')
        this.checkmarkBucket.check.transition('scale in')
    }

    set color(val){
        this.__color = val
        //this.checkmarkBucket.loader.style.borderLeftColor   = val
    }
}