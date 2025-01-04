class sk_ui_inputLabel extends sk_ui_input {
    constructor(opt) {
        super(opt)


        this.onKeyDown = _e => {
            if (_e.key === 'Escape') {
                this.cancelled = true
                delete this.__focusValue
                this.__cancelBlur = true
                this.input.blur()
            }

            if (_e.key === 'Enter') {
                delete this.__focusValue
                if (this.onValueSet) this.onValueSet(this.value)
                this.__cancelBlur = true
                this.input.blur()
            }
        }

        this.input.addEventListener('blur', _e => {
            if (!this.__cancelBlur) if (this.onValueSet) this.onValueSet(this.value)
            delete this.__cancelBlur
        })
    }

    get focused() {
        return document.activeElement.id === this.input.id
    }
}