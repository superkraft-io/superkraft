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

                        focus: _e => {
                            this.__focusValue = (this.type !== 'number' ? this.stripSuffix() : Number(this.stripSuffix()))
                        },

                        input: _e => {
                            if (this.type === 'number') return
                            if (this.onChanged) this.onChanged(this.stripSuffix())
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

        this.attributes.add({ friendlyName: 'Value', name: 'value', type: 'text', onSet: val => { this.input.value = val }, onGet: () => { return this.input.value } })
        this.attributes.add({ friendlyName: 'Min', name: 'min', type: 'text', onSet: val => { this.input.setAttribute('min', val) } })
        this.attributes.add({ friendlyName: 'Max', name: 'max', type: 'text', onSet: val => { this.input.setAttribute('max', val) } })

        this.attributes.add({
            friendlyName: 'Read Only', name: 'readonly', type: 'bool', onSet: val => {
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
        
        this.attributes.add({friendlyName: 'Suffix', name: 'suffix', type: 'text', onSet: val => {
            
        }})

        this.input = this.inputBucket.input
        this.__value = ''
    }

    setSelectionRange(input, selectionStart, selectionEnd) {
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        }
        else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    }

    stripSuffix(_val) {
        var val = _val || this.value
        if (!this.suffix) return val
        return val.replace(this.suffix, '')
    }

    fixNumber(val) {
        if (val.length === 0) {
            if (this.min) val = this.min
            else val = 0
        }

        val = val.replace(/[^0-9]/g, '');

        return Number(val)
    }

    fixSuffix() {
        //if (!this.suffix) return

        return new Promise(resolve => {
            setTimeout(() => {
                var tmpVal = this.stripSuffix()
                tmpVal = this.fixNumber(tmpVal)
                if (isNaN(tmpVal)) tmpVal = ''
                this.value = Date.now()
                this.value = tmpVal + (this.suffix || '')
                resolve()
            }, 1)
        })
    }


    configAs_number(){
        var accepted = '0123456789'
        var controlKeys = ['Delete', 'Backspace', 'Home', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
        var destructiveKeys = ['Delete', 'Backspace']

        var firstKeyDown = false

        this.element.addEventListener('keydown', async _e => {
            var textSelRange = { start: this.input.selectionStart, end: this.input.selectionEnd }

            if (firstKeyDown) {
                var x = 0
            }

            firstKeyDown = !firstKeyDown
            

            if (this.onKeyDown) this.onKeyDown(_e)

            if (_e.code === 'Tab') return
            if (this.cancelled){
                delete this.cancelled

                this.value = this.__focusValue

                return
            }
            
            var controlKeysUsed = false

            if (_e.ctrlKey || _e.shiftKey || _e.altKey || controlKeys.includes(_e.key)) controlKeysUsed = true

            var notNumber = (!/^[0-9]$/.test(_e.key))

            if ((_e.keyCode >= 48 && _e.keyCode <= 57) || (_e.keyCode >= 96 && _e.keyCode <= 105)) { 
                // 0-9 only
            } else {
                notNumber = true
                if (destructiveKeys.includes(_e.key)) {
                    await this.fixSuffix()
                    if (_e.key === 'Delete') this.setSelectionRange(this.input, textSelRange.start, textSelRange.start)
                    if (_e.key === 'Backspace') this.setSelectionRange(this.input, textSelRange.start - 1, textSelRange.start - 1)

                    var textLenBegin = this.stripSuffix().length
                    await this.fixSuffix()

                    return
                }
                if (controlKeysUsed) return await this.fixSuffix()
                else {
                    //await this.fixSuffix()
                    return _e.preventDefault()
                }
            }

            if (notNumber) return _e.preventDefault()

            var textLenBegin = this.stripSuffix().length

            await this.fixSuffix()


            setTimeout(async () => {
                if (this.min !== undefined && this.max !== undefined) {
                    try {
                        var withoutSuffix = this.stripSuffix()
                        var num = Number(withoutSuffix)
                        if (num < this.min || num > this.max) {
                            this.value = Date.now()
                            this.value = this.__lastValue || this.__focusValue + (this.suffix || '')
                            this.setSelectionRange(this.input, textSelRange.start, textSelRange.start)
                            return _e.preventDefault()
                        }
                    } catch (err) {
                        this.value = this.__lastValue || this.__focusValue
                        this.input.setSelectionRange(textSelRange.start, textSelRange.start)
                        return _e.preventDefault()
                    }
                }

                var tmpValue = this.value

                if (this.onFormat) tmpValue = this.onFormat(tmpValue) || tmpValue

                this.__value = tmpValue

                this.__lastValue = this.__value

                await this.fixSuffix()

                if (textSelRange.start === textSelRange.end) {
                    this.setSelectionRange(this.input, textSelRange.start + 1, textSelRange.start + 1)
                } else {
                    var selLen = textSelRange.end - textSelRange.start
                    var selLenRightOffset = textLenBegin - selLen
                    var suffixLength = 0
                    if (this.suffix) suffixLength = this.suffix.length

                    this.setSelectionRange(this.input, this.value.length - (selLenRightOffset + suffixLength), this.value.length - (selLenRightOffset + suffixLength))
                }

                if (this.onChanged) this.onChanged(this.stripSuffix())
            }, 1)
        })
    }

    configAs_phone(){
        //China has the longest possible number at 13 digits
        //We account for using 00 instead of + and country code e.g 46 instead of 0. So 4 additional digits.
        this.inputBucket.input.maxLength = 13 + 4
        var accepted = '+0123456789'
        var controlKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'a', 'x', 'c', 'v', 'z']
        this.element.addEventListener('keydown', _e => {
            if (this.onKeyUp) this.onKeyUp(_e)

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