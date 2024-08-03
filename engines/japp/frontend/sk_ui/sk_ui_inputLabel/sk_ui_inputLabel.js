class sk_ui_inputLabel extends sk_ui_input {
    constructor(opt) {
        super(opt)


        this.onKeyDown = _e => {
            if (_e.key === 'Escape') {
                this.cancelled = true
                delete this.__focusValue
                this.input.blur()
            }

            if (_e.key === 'Enter') {
                delete this.__focusValue
                if (this.onValueSet) this.onValueSet(this.value)
                this.input.blur()
            }
        }
    }
}