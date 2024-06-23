class sk_ui_textarea extends sk_ui_component {
    constructor(opt){
        super({...opt, ...{htmlTag: 'textarea'}})

        this.classRemove('sk_ui_noSelect')

        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'text', onSet: val => { this.element.value = val }, onGet: val => { return this.element.value }})
        this.attributes.add({friendlyName: 'Name', name: 'name', type: 'text', onSet: val => { this.element.name = val }})
        this.attributes.add({friendlyName: 'Placeholder', name: 'placeholder', type: 'text', onSet: val => { this.element.placeholder = val }})


        this.element.addEventListener('input', _e => {
            if (this.onChanged) this.onChanged(this.element.value)
        })
    }
}