class sk_ui_loader extends sk_ui_component {
    constructor(opt){
        super(opt)

        //this.classAdd('ui active centered inline loader')
        //this.element.style.color = 'white'

        this.shape = this.add.component(_c => {
            _c.classAdd('sk_ui_loader_shape sk_ui_spin')
            _c.styling += ' fullwidth fullheight'
            _c.element.style.setProperty('--color', 'white')
            _c.element.style.setProperty('--percent', '30')
            _c.element.style.setProperty('--thickness', '2px')
            _c.rotating = true
        })

        this.styling = 'left'

        this.attributes.add({friendlyName: 'Speed', name: 'speed', type: 'text', onSet: val => {
            this.classRemove('slow fast')
            this.classAdd(val)
        }})

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'text', onSet: val => {
            this.shape.element.style.setProperty('--color', val)
        }})

        this.attributes.add({friendlyName: 'Percent', name: 'percent', type: 'number', onSet: val => {
            this.shape.element.style.setProperty('--percent', val)
        }})

        this.attributes.add({friendlyName: 'Thickness', name: 'thickness', type: 'number', onSet: val => {
            this.shape.element.style.setProperty('--thickness', val + 'px')
        }})

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', onSet: val => {
            this.style.minWidth = val + 'px'
            this.style.minHeight = val + 'px'
        }})

        this.attributes.add({friendlyName: 'Inverted', name: 'inverted', type: 'bool', onSet: val => {
            throw new Error('Deprecated')
        }})

        this.attributes.add({friendlyName: 'Indeterminate', name: 'indeterminate', type: 'bool', onSet: val => {
            throw new Error('Deprecated')
        }})

        this.attributes.add({friendlyName: 'Double', name: 'double', type: 'bool', onSet: val => {
            throw new Error('Deprecated')
        }})

        this.attributes.add({friendlyName: 'Elastic', name: 'elastic', type: 'bool', onSet: val => {
            throw new Error('Deprecated')
        }})
    }

}