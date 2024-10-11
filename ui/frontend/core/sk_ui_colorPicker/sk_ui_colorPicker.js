class sk_ui_colorPicker extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.add.component(_c => {
            _c.classAdd('sk_ui_colorPicker_filledPanel sk_ui_check_pattern')
            _c.animate = false
        })

        this.colorPanel = this.add.component(_c => {
            _c.classAdd('sk_ui_colorPicker_filledPanel')
            _c.animate = false
        })

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


        this.colorPanel.backgroundColor = '#000000ff'
        

        this.element.addEventListener('click', ()=>{
            this.inputBucket.clrPicker.click()
        })

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'color', onSet: val =>{
            this.inputBucket.clrPicker.value = val
            this.colorPanel.backgroundColor = val

            if (!this.ignoreFireOnChanged){
                if (this.onChanged) this.onChanged(this.color, this.customOnChangedOpts)
            }
        }})

        this.clrPicker = this.inputBucket.input_clrPicker
    }
}