class sk_ui_image extends sk_ui_component {
    constructor(opt){
        super(opt)
        
        this.attributes.add({friendlyName: 'URL', name: 'url', type: 'text', onSet: val => {
            this.style.backgroundImage = `url("${val}")`
        }})

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', units: {min: 32, max: 512}, onSet: val => {
            this.style.minWidth = val + 'px'
            this.style.minHeight = val + 'px'
        }})
    }
}