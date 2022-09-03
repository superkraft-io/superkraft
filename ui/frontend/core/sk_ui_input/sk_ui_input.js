class sk_ui_input extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)

        this.inputBucket = JSOM.parse({root: this.element, tree: {
            div_inputEl: { class: 'ui input',
                input_input: {
                    type: 'text',
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


        this.sk_attributes.add({friendlyName: 'Placeholder', name: 'placeholder', type: 'text', onSet: val => { this.inputBucket.input.placeholder = val }})
        this.sk_attributes.add({friendlyName: 'Type', name: 'type', type: 'list', items: ['text', 'password', 'email'], onSet: val => { this.inputBucket.input.type = val }})
        this.sk_attributes.add({friendlyName: 'Value', name: 'value', type: 'text', onSet: val => { this.inputBucket.input.value = val }})
        //this.sk_attributes.add({friendlyName: 'Auto-Complete', name: 'autocomplete', type: 'bool', onSet: val => { this.inputBucket.input.autocomplete = val }})
        
        this.input = this.inputBucket.input
    }
}