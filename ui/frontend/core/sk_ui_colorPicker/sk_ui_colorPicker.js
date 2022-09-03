class sk_ui_colorPicker extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)

        this.inputBucket = JSOM.parse({root: this.element, tree: {
            input_clrPicker: { type: 'color', style: 'width: 100%; height: 100%; border-style: none; padding: 0px; border-width: 0px; background-color: transparent; border-color: transparent;',
                events: {
                    input: _e => {
                        this.color = this.inputBucket.clrPicker.value
                        if (this.onChanged) this.onChanged(this.color)
                    }
                }
            },
        }})



        this.sk_attributes.add({friendlyName: 'Color', name: 'color', type: 'color', onSet: val =>{
            this.inputBucket.clrPicker.value = val
        }})
    }
}