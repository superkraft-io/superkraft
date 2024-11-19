class sk_ui_image extends sk_ui_component {
    constructor(opt){
        super(opt)
        
        this.compact = true

        this.attributes.add({friendlyName: 'URL', name: 'url', type: 'text', onSet: async val => {
            this.loaderInitTimer = setTimeout(()=>{
                this.loader = this.add.loader(_c => {
                    _c.classAdd('sk_ui_image_loader')
                    _c.animate = false
                })
            }, 100)

            try {
                var _url = await sk_ui_image.validateImage(val, this)
                if (this.onLoaded) this.onLoaded()
            } catch(err) {
                if (this.onError) this.onError()
            }

            this.style.backgroundImage = `url("${_url}")`


            clearTimeout(this.loaderInitTimer)
            if (this.loader){
                await this.loader.transition('scale out')
                this.loader.remove()
                delete this.loader
            }
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
            if (url instanceof File){
                const reader = new FileReader();
                reader.onload = res => {
                    resolve(res.target.result)
                }

                reader.onerror = err => {
                    reject()
                }
                reader.readAsDataURL(url);
            } else {
                var img = new Image()

                img.onload = ()=>{
                    if (target){
                        target.__imageWidth = img.width
                        target.__imageHeight = img.height
                        target.__imageRatio = img.width / img.height
                    }
                    resolve(url)
                }

                img.onerror = res => {
                    reject()
                }

                img.src = url;
            }
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