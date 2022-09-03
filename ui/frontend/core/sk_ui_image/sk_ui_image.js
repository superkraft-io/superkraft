class sk_ui_image extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)
        
        this.sk_attributes.add({friendlyName: 'URL', name: 'url', type: 'text', onSet: val => {
            this.style.backgroundImage = `url("${val}")`
        }})

        this.sk_attributes.add({friendlyName: 'Size', name: 'size', type: 'number', units: {min: 32, max: 512}, onSet: val => {
            this.style.width = val + 'px'
            this.style.height = val + 'px'
        }})
    }
}