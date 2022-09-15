class sk_ui_label extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.contextMenu.blockPropagation = false

        this.element.innerText = 'Label'

        this.styling = 'left'

        this.attributes.add({friendlyName: 'Text', name: 'text', type: 'text', onSet: async val => {
            if (!this.fadeOnChange) return this.element.innerText = val

            var currentOpacity = this.opacity
            this.opacity = 0
            await sk.utils.sleep(200)
            this.element.innerText = val
            this.opacity = currentOpacity
        }})

        this.attributes.add({friendlyName: 'Fade On Change', name: 'fadeOnChange', type: 'bool'})
        
        
        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', units: {max: 50}, css: 'font-size?px'})
        this.attributes.add({friendlyName: 'Weight', name: 'weight', type: 'number', units: {step: 100, min: 0, max: 900}, css: 'font-weight?'})
        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'color', css: 'color?'})
        this.attributes.add({friendlyName: 'Wrap', name: 'wrap', type: 'bool', onSet: val => {
            this.style.whiteSpace = '';
            if (val) this.style.whiteSpace = 'normal'
        }})

        this.attributes.add({friendlyName: 'L10N', name: 'l10n', type: 'text', onSet: val => {
            var phrase = sk.l10n.getPhrase(val)

            if (!phrase){
                console.error(`No localization phrase found for identifier "${val}"`)
                return
            }

            var asHTML = (phrase.indexOf('!html!') > -1 ? true : false)
            
            if (asHTML){
                this.vertical = true
                this.element.innerHTML = phrase.replace('!html!', '').trim()
            } else {
                this.element.innerText = phrase
            }
        }})
    }
}