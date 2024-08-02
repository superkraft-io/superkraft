class sk_ui_led extends sk_ui_button {
    constructor(opt) {
        super(opt)

        this._icon.remove()
        this.label.remove()

        this.glow = this.add.component(_c => {
            _c.classAdd('sk_ui_led_glow')
        })
    }

    set active(val) {
        this.__led_state = val
        if (val) {
            this.classAdd('sk_ui_led_on')
        } else {
            this.classRemove('sk_ui_led_on')

        }
    }

    get active() { return this.__led_state }
}