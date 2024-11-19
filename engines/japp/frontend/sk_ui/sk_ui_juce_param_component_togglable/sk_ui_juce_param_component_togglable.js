class sk_ui_juce_param_component_togglable extends sk_ui_component {
    constructor(opt) {
        super(opt)
    }
}

var sk_ui_juce_sk_ui_onAfterCreate = function(_c){
    sk_ui_juce_param_component_root.configRootHandlers(_c)

    _c.readValue = async function(readValue){
        if (this.__busyReading) return

        var value = (await this.__readValue()).value

        try { value = value.toLowerCase() } catch (err) { }

        var normalizedValue = 0

        if ([1, '1', true, 'true'].includes(value)) normalizedValue = 1

        if (this.__lastReadValue === normalizedValue) return

        this.__lastReadValue = normalizedValue


        this.changedFromRead = true

        if (this instanceof sk_ui_checkbox) this.checked = normalizedValue === 1
        if (this instanceof sk_ui_switch) this.toggled = normalizedValue === 1

        this.onChanged(normalizedValue)
        this.changedFromRead = false
    }


    _c.setValueFromExternalSource = function (value) {
        this.changedFromRead = true

        if (this instanceof sk_ui_checkbox) this.checked = value
        if (this instanceof sk_ui_switch) this.toggled = value

        this.onChanged(this.toggled)
        this.changedFromRead = false
        if (this.onSetValueFromExternalSource) this.onSetValueFromExternalSource(value)
    }
}


async function waitForSK() {
    return new Promise(resolve => {
        var timer = setInterval(() => {
            if (!sk) return
            clearInterval(timer)
            resolve()
        }, 1)
    })
}

waitForSK().then(() => {
    document.addEventListener('sk_onAfterComponentCreated', _e => {
        var _c = _e.detail
        if (_c instanceof sk_ui_checkbox || _c instanceof sk_ui_switch) {
            sk_ui_juce_sk_ui_onAfterCreate(_c)
        }
    })
})