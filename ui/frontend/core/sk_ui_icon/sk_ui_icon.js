class sk_ui_icon extends sk_ui_component {
    constructor(opt){
        super({...opt, ...{htmlTag: 'i'}})

        this.classAdd('sk_ui_icon_customColor')

        this.invisible = true
        
        this.__size = 16

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

           

            this.element.innerHTML = ''

            if (val.indexOf('.svg') > -1){
                this.classRemove('icon')
                this.classRemove(lastIcon)
                this.type = 'svg'
            } else {
                 if (sk.utils.isEmoji(val.toString())){
                    this.element.innerHTML = val
                    this.classRemove('icon')
                    this.classRemove(lastIcon)
                    this.element.style.fontStyle = 'unset'
                    return
                }

                this.type = 'icon'
                if (this.svgEl){
                    this.svgEl.remove()
                    delete this.svgEl
                }
            }

            if (this.onChanged) this.onChanged()

            if (this.type === 'svg'){
                //this.element.setAttribute('src', val)
                this.svgLoading = true

                var response = await fetch(val)
                let text = await response.text();
                const parser = new DOMParser();
                const htmlItem = parser.parseFromString(text, "image/svg+xml");
                try {
                    this.element.appendChild(htmlItem.documentElement)
                } catch(err) {
                    this.element.appendChild(document.createElement('svg'))
                }
                
                this.svgEl = this.element.childNodes[0]
                this.svgEl.setAttribute('width', this.size)
                this.svgEl.setAttribute('height', this.size)
                this.svgEl.classList.add('sk_ui_transition')

                if (this.color !== 'source'){
                    if (!this.noFill) this.svgEl.setAttribute('fill', this.color)
                }

                this.style.display = 'inherit'

                if (!this.noFill) if (this.__svg_color) this.color = this.__svg_color
            }

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

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', units: {min: 10, max: 50}, onSet: async val => {
            this.iconElement.style.fontSize  = val + 'px'
            this.iconElement.style.minWidth  = val + 'px'
            this.iconElement.style.minHeight = val + 'px'

            if (this.type === 'svg'){
                if (this.svgLoading) await this.awaitSVGLoaded()
                
                this.svgEl.setAttribute('width', val)
                this.svgEl.setAttribute('height', val)
            }
        }})

        this.attributes.add({friendlyName: 'No fill', name: 'noFill', type: 'bool', onSet: val => {
            this.icon = this.icon
            if (val){
                this.style.color = 'unset'
                this.classRemove('sk_ui_icon_customColor')
            }
        }})

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'color', onSet: val => {
            if (val === 'source') this.classRemove('sk_ui_icon_customColor')
            else this.classAdd('sk_ui_icon_customColor')

            if (this.type === 'svg'){
                var allSubEls = this.svgEl
                
                var applyToChildren = el => {
                    if (!el) return

                    el.style.fill = val

                    var children = el.children
                    for (var i in children){
                        var child = children[i]
                        try { applyToChildren(child) } catch(err) {
                            var x = 0
                        }

                        try { child.style.fill = val } catch(err) {
                            var y = 0
                        }
                    }
                }

                if (!allSubEls) {
                    this.__svg_color = val
                    this.__color = undefined
                }

                if (!this.noFill){
                    applyToChildren(allSubEls)

                    if (this.svgEl) this.svgEl.style.fill = val
                }
            } else {
                if (!this.noFill)  this.style.color = val
            }
        }})

        this.attributes.add({friendlyName: 'Spinning', name: 'spinning', type: 'text', onSet: val => {
            this.classRemove('sk_ui_spin sk_ui_spin_slow')
            if (val === false) return
            this.classAdd('sk_ui_spin' + (val === true ? '' : '_' + val))
        }})
    }

    awaitSVGLoaded(){
        return new Promise(resolve => {
            var timer = setInterval(()=>{
                if (this.svgEl){
                    clearInterval(timer)
                    resolve()
                }
            })
        })
    }
}