class sk_ui_colorPicker extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.inputBucket = JSOM.parse({root: this.element, tree: {
            input_clrPicker: { type: 'color', style: 'opacity: 0; width: 100%; height: 100%; border-style: none; padding: 0px; border-width: 0px; background-color: transparent; border-color: transparent;',
                events: {
                    input: _e => {
                        this.color = this.inputBucket.clrPicker.value
                        if (this.onChanged) this.onChanged(this.color)
                    }
                }
            },
        }})


        this.backgroundColor = '#000000ff'
        

        this.element.addEventListener('click', ()=>{
            this.inputBucket.clrPicker.click()
        })

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'color', onSet: val =>{
            this.inputBucket.clrPicker.value = val
            this.backgroundColor = val
            if (!this.ignoreFireOnChanged){
                if (this.onChanged) this.onChanged(this.color, this.customOnChangedOpts)
                }
        }})

        this.clrPicker = this.inputBucket.input_clrPicker
    }
}