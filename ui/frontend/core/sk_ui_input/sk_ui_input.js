class sk_ui_input extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.inputBucket = JSOM.parse({root: this.element, tree: {
            div_inputEl: { class: 'ui input',
                input_input: {
                    type: 'text',
                    autocomplete: 'off',
                    events: {
                        /*keyup: _e => {
                            this.value = this.input.value
                            if (this.onChanged) this.onChanged(this.value)
                        },*/

                        mousedown: _e => {
                            if (_e.button !== 0) return
                            //_e.preventDefault()
                            _e.stopPropagation()
                        },

                        mouseup: _e => {
                            if (_e.button !== 0) return
                            //_e.preventDefault()
                            _e.stopPropagation()
                        },

                        click: _e => {
                            if (_e.button !== 0) return
                            //_e.preventDefault()
                            _e.stopPropagation()
                        },

                        input: _e => {
                            if (this.onChanged) this.onChanged(this.input.value)
                        }
                    }
                }
            }
        }})


        this.attributes.add({friendlyName: 'Placeholder', name: 'placeholder', type: 'text', onSet: val => { this.inputBucket.input.placeholder = val }})
        this.attributes.add({friendlyName: 'Type', name: 'type', type: 'list', items: ['text', 'password', 'email', 'number'], onSet: val => {
            var nonNumbers = ['text', 'password', 'email']
            if (nonNumbers.includes(val)){
                this.inputBucket.input.type = val
                return
            }

            this['configAs_' + val]()
        }})
        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'text', onSet: val => { this.inputBucket.input.value = val }, onGet: ()=>{ return this.input.value }})
        this.attributes.add({friendlyName: 'Read Only', name: 'readonly', type: 'bool', onSet: val => {
            this.input.removeAttribute('readonly')
            if (val) this.input.setAttribute('readonly', '')
        }})
        this.attributes.add({friendlyName: 'Disabled', name: 'disabled', type: 'text', onSet: val => { this.inputBucket.input.disabled = (val ? 'true' : '') }})
        //this.attributes.add({friendlyName: 'Auto-Complete', name: 'autocomplete', type: 'bool', onSet: val => { this.inputBucket.input.autocomplete = val }})
        this.attributes.add({friendlyName: 'Name', name: 'name', type: 'text', onSet: val => {
            this.input.removeAttribute('autocomplete')
            this.input.name = val
        }})
        

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'text', onSet: val => {
            var colors = ['red', 'green']
            colors.forEach(_clr => this.classRemove('sk_ui_input_color_' + _clr))
            if (colors.includes(val)) this.classAdd('sk_ui_input_color_' + val)
        }})
        


        this.input = this.inputBucket.input
        this.__value = ''
    }

    configAs_number(){
        var accepted = '0123456789'
        var controlKeys = ['Delete', 'Backspace', 'Home', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
        this.element.addEventListener('keydown', _e => {
            if (_e.code === 'Tab') return
            if (this.cancelled){
                delete this.cancelled
                return
            }
            
            var controlKeysUsed = false

            if (_e.ctrlKey || _e.shiftKey || _e.altKey || controlKeys.includes(_e.key)) controlKeysUsed = true


            if ((_e.keyCode >= 48 && _e.keyCode <= 57) || (_e.keyCode >= 96 && _e.keyCode <= 105)) { 
                // 0-9 only
            } else { 
                if (controlKeysUsed) return
                return _e.preventDefault()
            } 

            this.__value = this.value
        })
    }

    configAs_phone(){
        //China has the longest possible number at 13 digits
        //We account for using 00 instead of + and country code e.g 46 instead of 0. So 4 additional digits.
        this.inputBucket.input.maxLength = 13 + 4
        var accepted = '+0123456789'
        var controlKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'a', 'x', 'c', 'v', 'z']
        this.element.addEventListener('keydown', _e => {
            if (_e.code === 'Tab') return
            if (this.cancelled){
                delete this.cancelled
                return
            }

            if (_e.ctrlKey && controlKeys.includes(_e.key)) return

            if (accepted.indexOf(_e.key) === -1 && !controlKeys.includes(_e.key)) return _e.preventDefault()

            if (_e.key === '+' && this.value.length > 0) return _e.preventDefault()

            this.__value = this.value

            if (this.value.length >= 8 && !this._phoneNrOKNotified){
                if (this.onPhoneNumberOK) this.onPhoneNumberOK(this.value)
                this._phoneNrOKNotified = true
            }

            if (this.value.length < 8 && this._phoneNrOKNotified){
                if (this.onPhoneNumberFail) this.onPhoneNumberFail()
                this._phoneNrOKNotified = false
            }
        })
    }
}