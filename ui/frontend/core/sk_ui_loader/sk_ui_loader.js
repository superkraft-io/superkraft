class sk_ui_loader extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.classAdd('ui active cetered inline loader')

        this.styling = 'left'

        this.attributes.add({friendlyName: 'Speed', name: 'speed', type: 'text', onSet: val => {
            this.classRemove('slow fast')
            this.classAdd(val)
        }})

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'text', onSet: val => {
            this.classRemove('primary secondary red orange yellow olive green teal blue violet purple pink brown grey black')
            this.classAdd(val)
        }})

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'text', onSet: val => {
            this.classRemove('mini tiny small medium large big huge massive')
            this.classAdd(val)
        }})

        this.attributes.add({friendlyName: 'Inverted', name: 'inverted', type: 'bool', onSet: val => {
            this.classRemove('inverted')
            if (val) this.classAdd('inverted')
        }})

        this.attributes.add({friendlyName: 'Indeterminate', name: 'indeterminate', type: 'bool', onSet: val => {
            this.classRemove('indeterminate')
            if (val) this.classAdd('indeterminate')
        }})

        this.attributes.add({friendlyName: 'Indeterminate', name: 'indeterminate', type: 'bool', onSet: val => {
            this.classRemove('indeterminate')
            if (val) this.classAdd('indeterminate')
        }})

        this.attributes.add({friendlyName: 'Double', name: 'double', type: 'bool', onSet: val => {
            this.classRemove('double')
            if (val) this.classAdd('double')
        }})

        this.attributes.add({friendlyName: 'Elastic', name: 'elastic', type: 'bool', onSet: val => {
            this.classRemove('elastic')
            if (val) this.classAdd('elastic')
        }})
    }
}