class sk_ui_separator extends sk_ui_component {
    constructor(opt){
        super(opt)
        
        this.styling = 'fullwidth'

        this.backgroundColor = 'grey'
        this.height = 1

        this.attributes.add({friendlyName: 'Vertical', name: 'vertical', type: 'bool', onSet: val => {
            this.styling = 'fullheight'
            this.width = 1
        }})
        this.__vertical = false
    }
}