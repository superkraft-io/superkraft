class sk_ui_juce_param_component_draggable extends sk_ui_juce_param_component_root {
    constructor(opt) {
        super(opt)

        this.dragSensitivity = 0.5

        this.valueRange = { min: 0, max: 100 }
        this.defaultValue = 0

        var mouseMoveHandler = async _e => {
            if (!this.__sk_ui_juce_param_component_root_mdPos) return

            sk.interactions.block()

            _e.stopPropagation()
            _e.preventDefault()


            var pos = sk.interactions.getPos(_e)

            var diff = {
                x: this.__sk_ui_juce_param_component_root_mdPos.x - pos.x,
                y: this.__sk_ui_juce_param_component_root_mdPos.y - pos.y
            }

            var newVal = diff.y * this.dragSensitivity

            this.value = this.__sk_ui_juce_param_component_draggable_mdValue + newVal
        }


        this.__sk_ui_juce_param_component_root_mouseDown = _e => {
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
        })

        this.element.addEventListener('keydown', _e => {
            if (_e.code === 'ArrowUp' || _e.code === 'ArrowRight') this.value += (_e.shiftKey ? 1 : 5)
            else if (_e.code === 'ArrowDown' || _e.code === 'ArrowLeft') this.value -= (_e.shiftKey ? 1 : 5)

        })

        this.element.addEventListener('dblclick', _e => {
            _e.preventDefault()
            _e.stopPropagation()

            this.value = this.defaultValue
        })

        this.tweener = new SK_Tween({
            speed: 20,
            onChanged: res => {
                this.preValueEdited(res.current)
            }
        })
    }

    initWithValue(value) {
        this.value = value

        this.tweener.target = value
        this.tweener.current = value

        this.preValueEdited(value)
    }
    set value(val) {
        this.__value = val


        if (val > this.valueRange.max) this.__value = this.valueRange.max
        if (val < this.valueRange.min) this.__value = this.valueRange.min

        if (!this.__manuallyChanged) {
            this.tweener.to(this.__value)
        } else {
            this.tweener.target = this.__value
            this.tweener.current = this.__value
            this.preValueEdited(this.__value)
        }
    }

    preValueEdited(value) {
        if (this.onPreUpdate) this.onPreUpdate(value)
        if (this.onUpdate) this.onUpdate(value)
    }

    get value() { return this.__value }
    set rangeMinimum(val) {
        this.valueRange.min = val
        if (this.onUpdate) this.onUpdate(val)
    }

    set rangeMaximum(val) {
        this.valueRange.max = val
        if (this.onUpdate) this.onUpdate(val)
    }
}