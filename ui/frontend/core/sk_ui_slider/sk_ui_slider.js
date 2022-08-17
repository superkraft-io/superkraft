class sk_ui_slider extends sk_ui_component {
    constructor(opt){
        super(opt)
        

        this.sliderBucket = JSOM.parse({root: this.element, tree: {
            div_sliderEl: { class: 'ui slider inverted small' }
        }})
        this.slider = $(this.sliderBucket.sliderEl)

        var update = ()=>{
            $(this.slider).slider({
                min: this.min || 0,
                max: this.max || 50,
                start: this.value || 14,
                step: this.step || 1,
                smooth: this.smooth || true,
                interpretLabel: (this.labels ? (value)=>{
                    return this.labels[value];
                } : undefined),

                onMove: ()=>{
                    if (this.onChanged) this.onChanged($(this.slider).slider('get value'))
                }
            })
        }
        update()

        /*var height = 12
        this.style.height = height

        this.style.position = 'relative'
        this.add.component(_c => {
            _c.styling = 'fullwidth'
            _c.backgroundColor = 'grey'
            _c.style.height = '3px'
            _c.roundness = 3
        })

        this.handle = this.add.component(_c => {
            _c.backgroundColor = 'white'
            _c.style.width = height + 'px'
            _c.style.height = height + 'px'
            _c.roundness = 12
            _c.style.position = 'absolute'
            _c.style.left = '0px'
        })

        this.element.addEventListener('mousedown', _e => {
            this.mouseDown = {x: _e.layerX, y: _e.layerY}
        })

        
        this.element.addEventListener('mouseup', _e => {
            this.mouseDown = undefined
        })

        this.element.addEventListener('mouseover', _e => {
            if (!this.mouseDown) return
            var pos = {x: _e.layerX, y: _e.layerY}
            this.handle.style.left = pos.x + 'px'
        })*/
        
        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'number', onSet: val => { this.slider.slider('set value', val) }, onGet: ()=>{ return this.slider.slider('get value') }})
        this.attributes.add({friendlyName: 'Step', name: 'step', type: 'number', onSet: val => { update() }})
        this.attributes.add({friendlyName: 'Min', name: 'min', type: 'number', onSet: val => { update() }})
        this.attributes.add({friendlyName: 'Max', name: 'max', type: 'number', onSet: val => { update() }})

        this.attributes.add({friendlyName: 'Labeled', name: 'labeled', type: 'bool', onSet: val => { this.sliderBucket.sliderEl.classList.remove('labeled'); if (val) this.sliderBucket.sliderEl.classList.add('labeled'); update() }})
        this.attributes.add({friendlyName: 'Ticked', name: 'ticked', type: 'bool', onSet: val => { this.sliderBucket.sliderEl.classList.remove('ticked'); if (val) this.sliderBucket.sliderEl.classList.add('ticked'); update() }})
        this.attributes.add({friendlyName: 'Smooth', name: 'smooth', type: 'bool', onSet: val => { this.sliderBucket.sliderEl.classList.remove('smooth'); if (val) this.sliderBucket.sliderEl.classList.add('smooth'); update() }})

        
        this.attributes.add({friendlyName: 'Labels', name: 'labels', type: 'text', onSet: val => { update() }})
    }
}