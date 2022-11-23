class sk_ui_input extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.inputBucket = JSOM.parse({root: this.element, tree: {
            div_inputEl: { class: 'ui input',
                input_input: {
                    type: 'text',
                    autocomplete: 'off',
                    events: {
                        keyup: _e => {
                            this.value = this.input.value
                            if (this.onChanged) this.onChanged(this.value)
                        },

                        input: _e => {
                            this.value = this.input.value
                            if (this.onChanged) this.onChanged(this.value)
                        }
                    }
                }
            }
        }})


        this.attributes.add({friendlyName: 'Placeholder', name: 'placeholder', type: 'text', onSet: val => { this.inputBucket.input.placeholder = val }})
        this.attributes.add({friendlyName: 'Type', name: 'type', type: 'list', items: ['text', 'password', 'email'], onSet: val => { this.inputBucket.input.type = val }})
        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'text', onSet: val => { this.inputBucket.input.value = val }})
        //this.attributes.add({friendlyName: 'Auto-Complete', name: 'autocomplete', type: 'bool', onSet: val => { this.inputBucket.input.autocomplete = val }})
        this.attributes.add({friendlyName: 'Name', name: 'name', type: 'text', onSet: val => {
            this.input.removeAttribute('autocomplete')
            this.input.name = val
        }})
        

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'text', onSet: val => {
            var colors = ['red', 'green']
            colors.forEach(_clr => this.classRemove('sk_ui_input_color_' + _clr))
            if (colors.includes(val)) this.classAdd('sk_ui_input_color_' + val)
        }})
        


        this.input = this.inputBucket.input
    }
}