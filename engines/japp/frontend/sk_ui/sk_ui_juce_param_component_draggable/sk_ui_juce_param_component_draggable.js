class sk_ui_juce_param_component_draggable extends sk_ui_juce_param_component_root {
    constructor(opt) {
        super(opt)

        this.dragSensitivity = 0.5

        this.valueRange = { min: 0, max: 100 }
        this.defaultValue = 0

        this.invertY = true

        var mouseMoveHandler = async _e => {
            if (!this.__sk_ui_juce_param_component_root_mdPos) return

            sk.interactions.block()

            _e.stopPropagation()
            _e.preventDefault()


            var pos = sk.interactions.getPos(_e)

            

            if (_e.shiftKey) {
                if (!this.shiftPressed) {
                    this.shiftPressed = true
                    this.__sk_ui_juce_param_component_root_mdPos = pos
                    this.__sk_ui_juce_param_component_draggable_mdValue = this.value
                }
            } else {
                if (this.shiftPressed) {
                    this.__sk_ui_juce_param_component_root_mdPos = pos
                    this.__sk_ui_juce_param_component_draggable_mdValue = this.value
                    delete this.shiftPressed
                }
            }

            var diff = {
                x: pos.x - this.__sk_ui_juce_param_component_root_mdPos.x,
                y: pos.y - this.__sk_ui_juce_param_component_root_mdPos.y
            }

            if (this.invertX) diff.x = 0 - diff.x
            if (this.invertY) diff.y = 0 - diff.y
            
            var newVal = diff.y * this.dragSensitivity
            if (this.shiftPressed) newVal = newVal * 0.2

            this.value = this.__sk_ui_juce_param_component_draggable_mdValue + newVal
            this.applyValue()
        }


        this.__sk_ui_juce_param_component_root_mouseDown = _e => {
            this.__last_mdValue = 0
            this.__sk_ui_juce_param_component_draggable_mdValue = this.value

            this.__sk_ui_juce_param_component_draggable_manuallyChanging = true

            document.addEventListener('mousemove', mouseMoveHandler)

            if (this.onMouseDown) this.onMouseDown()
        }

        this.__sk_ui_juce_param_component_root_mouseUp = _e => {
            sk.interactions.unblock()

            delete this.__sk_ui_juce_param_component_draggable_manuallyChanging
            document.removeEventListener('mousemove', mouseMoveHandler)

            if (this.onMouseUp) this.onMouseUp()
        }

        this.element.addEventListener('wheel', _e => {
            this.value += (sk.os === 'win' ? 0 - _e.deltaY : _e.deltaY) / (_e.shiftKey ? 100 : 10)
            this.applyValue()
        })

        this.element.addEventListener('keydown', _e => {
            if (_e.code === 'ArrowUp' || _e.code === 'ArrowRight') this.value += (_e.shiftKey ? 1 : 5)
            else if (_e.code === 'ArrowDown' || _e.code === 'ArrowLeft') this.value -= (_e.shiftKey ? 1 : 5)
            this.applyValue()
        })

        this.element.addEventListener('dblclick', _e => {
            _e.preventDefault()
            _e.stopPropagation()

            this.value = this.defaultValue

            this.applyValue()
        })
    }

    applyValue() {
        this.writeValue({ value: this.__value })
    }

    set value(val) {
        this.__value = val

        if (val > this.valueRange.max) this.__value = this.valueRange.max
        if (val < this.valueRange.min) this.__value = this.valueRange.min

        if (this.onUpdate) this.onUpdate(this.__value)
    }

    get value() {
        return this.__value
    }

    set rangeMinimum(val) {
        this.valueRange.min = val
        if (this.onUpdate) this.onUpdate(val)
    }

    set rangeMaximum(val) {
        this.valueRange.max = val
        if (this.onUpdate) this.onUpdate(val)
    }

    async writeValue(opt) {
        return this.__writeValue(opt)
    }

    async readValue() {
        if (this.__sk_ui_juce_param_component_draggable_manuallyChanging || this.__busyReading) return

        this.__sk_ui_juce_param_component_draggable_blockWrite = true

        var normalizedValue = Number((await this.__readValue()).value)

        if (this.__lastReadValue === normalizedValue) return

        this.__lastReadValue = normalizedValue

        this.value = sk.utils.map(normalizedValue, 0, 1, this.valueRange.min, this.valueRange.max)

        this.__sk_ui_juce_param_component_draggable_blockWrite = false
    }

    setValueFromExternalSource(value) {
        this.value = value
        this.applyValue()
    }
}