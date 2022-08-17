class sk_ui_labelledSwitch extends sk_ui_component {
    constructor(opt){
        super(opt)
        
        this.multiComponent = true

        this.vertical = false

        this.labels = {}

        this.labels.left = this.add.label(_c => {
            _c.text = 'OFF'
            _c.size = 12
            _c.marginRight = 6
        }),

        this.switch = this.add.switch(_c => {
            _c.marginRight = 6
        })

        this.labels.right = this.add.label(_c => {
            _c.text = 'ON'
            _c.size = 12
        })
    }
}