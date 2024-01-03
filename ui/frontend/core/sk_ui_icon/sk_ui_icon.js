class sk_ui_icon extends sk_ui_component {
    constructor(opt){
        super({...opt, ...{htmlTag: 'i'}})

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
            if (val.indexOf('.svg') > -1){
                this.classRemove('icon')
                this.classRemove(lastIcon)
                this.type = 'svg'
            }

            if (this.onChanged) this.onChanged()

            if (this.type === 'svg'){
                //this.element.setAttribute('src', val)
                var xhr = new XMLHttpRequest();
                xhr.open("GET", val, false);
                xhr.overrideMimeType("image/svg+xml");
                xhr.addEventListener("load", res => {
                    this.element.appendChild(xhr.responseXML.documentElement)
                    
                    this.svgEl = this.element.childNodes[0]
                    this.svgEl.setAttribute('width', this.size)
                    this.svgEl.setAttribute('height', this.size)

                    this.svgEl.setAttribute('fill', this.color)
                })
                
                xhr.send()

                return
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

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', units: {min: 10, max: 50}, onSet: val => {
            this.iconElement.style.fontSize  = val + 'px'
            this.iconElement.style.minWidth  = val + 'px'
            this.iconElement.style.minHeight = val + 'px'

            if (this.type === 'svg'){
                this.svgEl.setAttribute('width', val)
                this.svgEl.setAttribute('height', val)
            }
        }})
        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'color', onSet: val => {
            if (this.type === 'svg'){
                var allSubEls = this.svgEl
                
                var applyToChildren = el => {
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

                applyToChildren(allSubEls)

                this.svgEl.style.fill = val
            } else {
                this.style.color = val
            }
        }})

        this.attributes.add({friendlyName: 'Spinning', name: 'spinning', type: 'text', onSet: val => {
            this.classRemove('sk_ui_spin sk_ui_spin_slow')
            if (val === false) return
            this.classAdd('sk_ui_spin' + (val === true ? '' : '_' + val))
        }})
    }
}