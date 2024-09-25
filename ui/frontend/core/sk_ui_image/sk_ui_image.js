class sk_ui_image extends sk_ui_component {
    constructor(opt){
        super(opt)
        
        this.attributes.add({friendlyName: 'URL', name: 'url', type: 'text', onSet: async val => {
            try {
                await sk_ui_image.validateImage(val, this)
                if (this.onLoaded) this.onLoaded()
            } catch(err) {
                if (this.onError) this.onError()
            }
            this.style.backgroundImage = `url("${val}")`
        }})

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', units: {min: 32, max: 512}, onSet: val => {
            this.style.minWidth = val + 'px'
            this.style.minHeight = val + 'px'
        }})


        this.attributes.add({friendlyName: 'Fit', name: 'fit', type: 'text', onSet: val => {
            this.style.backgroundSize = val
        }})
        this.__fit = 'contain'


        
    }

    static validateImage(url, target){
        return new Promise((resolve, reject)=>{
            var img = new Image()

            img.onload = ()=>{
                if (target){
                    target.__imageWidth = img.width
                    target.__imageHeight = img.height
                    target.__imageRatio = img.width / img.height
                }
                resolve()
            }

            img.onerror = res => {
                reject()
            };

            img.src = url;
        })
    }

    loadFromBlob(blob){
        const imageUrl = URL.createObjectURL(blob);
        this.style.background = `url("${imageUrl}")`;
        this.element.onload = () => {
            URL.revokeObjectURL(imageUrl);
        };
    }
}