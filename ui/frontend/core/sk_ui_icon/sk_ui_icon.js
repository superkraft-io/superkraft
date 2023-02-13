class sk_ui_icon extends sk_ui_component {
    constructor(opt){
        super({...opt, ...{htmlTag: 'i'}})

        this.invisible = true
        

        this.styling = 'center middle'
        this.classAdd('icon')

        /*this.iconBucket = JSOM.parse({root: this.element, tree: {
            i_icon: { class: 'icon transition' }
        }})

        */

        this.iconBucket = {icon: this.element}
        this.iconElement = this.element
        this.style.pointerEvents = 'none'

        

        this.attributes.add({friendlyName: 'Ignore Icon Def.', name: 'ignoreIconDefinition', type: 'bool'})
        
        
        var lastIcon = ''
        this.attributes.add({hide: true, friendlyName: 'Icon', name: 'icon', type: 'icon', onSet: async val => {
            if (this.onChanged) this.onChanged()
            //for (var i = this.iconElement.classList.length; i > -1; i--) if (this.iconElement.classList[i] !== 'transition') this.iconElement.classList.remove(this.iconElement.classList[i])
            
            var resetIcon = ()=>{
                this.classRemove('icon')
                this.classRemove(lastIcon)

                if (!this.ignoreIconDefinition) this.classAdd('icon')

                lastIcon = val
            }
            
            if (!val) return

            var split = val.split(' ')

            var change = ()=>{
                for (var i = 0; i < split.length; i++){
                    //this.iconElement.classList.add(split[i])
                    this.classAdd(split[i])
                }
            }

            

            if (!this.fadeOnChange){
                resetIcon()
                return change()
            }

            this.hideShow_2({onHidden: async ()=>{ return new Promise(resolve => {
                resetIcon()

                change()
                resolve()
            })}})

        }})
        
        this.attributes.add({friendlyName: 'Fade On Change', name: 'fadeOnChange', type: 'bool'})

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