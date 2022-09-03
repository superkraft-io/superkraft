class sk_ui_label extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)

        this.contextMenu.blockPropagation = false

        this.element.innerText = 'Label'

        this.styling = 'left'

        this.sk_attributes.add({friendlyName: 'Text', name: 'text', type: 'text', onSet: val => { this.element.innerText = val }})
        this.sk_attributes.add({friendlyName: 'Size', name: 'size', type: 'number', units: {max: 50}, css: 'font-size?px'})
        this.sk_attributes.add({friendlyName: 'Weight', name: 'weight', type: 'number', units: {step: 100, min: 0, max: 900}, css: 'font-weight?'})
        this.sk_attributes.add({friendlyName: 'Color', name: 'color', type: 'color', css: 'color?'})
        this.sk_attributes.add({friendlyName: 'Wrap', name: 'wrap', type: 'bool', onSet: val => {
            this.style.whiteSpace = '';
            if (val) this.style.whiteSpace = 'normal'
        }})

        this.sk_attributes.add({friendlyName: 'L10N', name: 'l10n', type: 'text', onSet: val => {
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