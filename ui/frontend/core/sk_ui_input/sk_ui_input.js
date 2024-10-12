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

                        dblclick: _e => {
                            _e.stopPropagation()

                        },

                        input: _e => {
                            this.__value = this.input.value
                            if (this.onChanged) this.onChanged(this.input.value)
                        },

                        focus: _e => {
                            this.__preFocusValue = this.value
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

        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'text', onSet: val => {
            if (this.min !== undefined){
                if (val < parseFloat(this.min)){
                    this.__value = this.inputBucket.input.value
                    return
                }
            }

            if (this.max !== undefined){
                if (val > parseFloat(this.max)){
                    this.__value = this.inputBucket.input.value
                    return
                }
            }

            this.inputBucket.input.value = val
        }, onGet: ()=>{ return this.input.value }})


        this.attributes.add({friendlyName: 'Read Only', name: 'readonly', type: 'bool', onSet: val => {
            this.input.removeAttribute('readonly')
            if (val) this.input.setAttribute('readonly', '')
        }})
        this.attributes.add({ friendlyName: 'Disabled', name: 'disabled', type: 'text', onSet: val => { this.inputBucket.input.disabled = (val ? 'true' : '') } })

        this.attributes.add({friendlyName: 'Disable Focus', name: 'disableFocus', type: 'bool', onSet: val => {
            if (val) this.input.setAttribute('tabindex', '-1')
            else this.input.removeAttribute('tabindex')
        }})

        this.attributes.add({friendlyName: 'Name', name: 'name', type: 'text', onSet: val => {
            this.input.removeAttribute('autocomplete')
            this.input.name = val
        }})
        

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'text', onSet: val => {
            var colors = ['red', 'green']
            colors.forEach(_clr => this.classRemove('sk_ui_input_color_' + _clr))
            if (colors.includes(val)) this.classAdd('sk_ui_input_color_' + val)
        }})


        this.attributes.add({ friendlyName: 'Min', name: 'min', type: 'number', onSet: val => { this.input.setAttribute('min', val) } })
        this.attributes.add({ friendlyName: 'Max', name: 'max', type: 'number', onSet: val => { this.input.setAttribute('maxlength', val) } })



        this.input = this.inputBucket.input
        this.input.id = this.element.id + '_input'
        this.__value = ''

        this.inputWrapper = this.inputBucket.inputEl
    }

    ensureValue(val) {
        return new Promise(resolve => {
            setTimeout(() => {
                this.value = Date.now()
                this.value = val
                resolve()
            })
        })
    }

    cleanValue() {
        setTimeout(async () => {
            await this.ensureValue(this.formatNumber(this.value))

            if (this.value === '-' || this.value === '.') return

            var lastChar = this.value.substr(this.value.length - 1, 1)
            if (lastChar === '.') return
            if (lastChar === '-') await this.ensureValue(this.value.replace('-', ''))

            if (this.min === undefined && this.max === undefined) return

            var numVal = Number(this.value)
            if (numVal < this.min) numVal = this.min
            if (numVal > this.max) numVal = this.max

            this.value = numVal
        }, 1)
    }

    formatNumber(value) {
        var res = value.replace(/[^0-9.-]/g, '')  // Remove non-numeric, non-dot, non-dash characters
        res = res.replace(/(?!^)-/g, '')    // Remove all but the first '-' character
        //res = res.replace(/^(-?\d+)\./, '$1') // Ensure '-' comes first
        //res = res.replace(/^(-?\d+)\..*/, '$1.'); // Allow only one '.'
        return res
    }

    configAs_number(){
        var accepted = '0123456789'
        var controlKeys = ['Delete', 'Backspace', 'Home', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
        var destructiveKeys = ['Delete', 'Backspace']

        var firstKD = false

        this.element.addEventListener('keydown', _e => {
            if (this.onKeyDown) this.onKeyDown(_e)


            if (_e.ctrlKey) {
                if (_e.shiftKey && _e.key === 'z') return
                if ('zxcv'.indexOf(_e.key) > -1) return
            }

            this.__lastValue = this.value


            if (_e.code === 'Tab') return
            if (this.cancelled) {
                this.value = this.__preFocusValue
                delete this.cancelled
                return
            }
            
            var controlKeysUsed = false

            if (_e.ctrlKey || _e.shiftKey || _e.altKey || controlKeys.includes(_e.key) || destructiveKeys.includes(_e.key)) controlKeysUsed = true


            var isNumber = !isNaN(parseInt(_e.key));
            var isNumberCharacterAllowed = '.,-'.indexOf(_e.key) > -1;

            if (isNumber || isNumberCharacterAllowed) { 
                // 0-9 only or . or , or -
                if (_e.key === '.' && this.value.indexOf('.') > -1) return _e.preventDefault()
            } else {
                if (controlKeysUsed) {
                    if (destructiveKeys.includes(_e.key)) return
                    else return
                }

                this.ensureValue(this.__lastValue)

                return _e.preventDefault()
            } 

            this.cleanValue()

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