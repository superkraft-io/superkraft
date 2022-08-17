class sk_ui_icon extends sk_ui_component {
    constructor(opt){
        super(opt)


        this.styling = 'center middle'

        this.iconBucket = JSOM.parse({root: this.element, tree: {
            i_icon: { class: 'icon transition' }
        }})

        this.iconElement = this.iconBucket.icon
        this.iconElement.style.pointerEvents = 'none'

        

        this.attributes.add({friendlyName: 'Ignore Icon Def.', name: 'ignoreIconDefinition', type: 'bool'})
        this.attributes.add({hide: true, friendlyName: 'Icon', name: 'icon', type: 'icon', onSet: val => {
            if (this.onChanged) this.onChanged()
            for (var i = this.iconElement.classList.length; i > -1; i--) if (this.iconElement.classList[i] !== 'transition') this.iconElement.classList.remove(this.iconElement.classList[i])
            if (!this.ignoreIconDefinition) this.iconElement.classList.add('icon')
            
            if (!val) return

            var split = val.split(' ')
            for (var i = 0; i < split.length; i++) this.iconElement.classList.add(split[i])
        }})
        

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', units: {min: 10, max: 50}, onSet: val => {
            this.iconElement.style.fontSize = val + 'px'
        }})
        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'color', css: 'color?'})

        this.attributes.add({friendlyName: 'Spinning', name: 'spinning', type: 'text', onSet: val => {
            this.classRemove('sk_ui_spin sk_ui_spin_slow')
            if (val === false) return
            this.classAdd('sk_ui_spin' + (val === true ? '' : '_' + val))
        }})
    }
}