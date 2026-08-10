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

        this.attributes.add({friendlyName: 'Autocomplete', name: 'autocomplete', type: 'bool', onSet: val => {
            var attr = 'off'
            if (val === true) attr = 'on'
            else if (val === false) attr = 'off'
            else attr = val
            
            this.input.setAttribute('autocomplete', attr)
        }})

        

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'text', onSet: val => {
            var colors = ['red', 'green']
            colors.forEach(_clr => this.classRemove('sk_ui_input_color_' + _clr))
            if (colors.includes(val)) this.classAdd('sk_ui_input_color_' + val)
        }})


        this.attributes.add({ friendlyName: 'Min', name: 'min', type: 'number', onSet: val => { this.input.setAttribute('min', val) } })
        this.attributes.add({ friendlyName: 'Max', name: 'max', type: 'number', onSet: val => { this.input.setAttribute('maxlength', val) } })

        // Vertical click+drag scrub: sensitivity = Δvalue per pixel (up increases unless invert).
        // Shift → ×0.1, Alt/Ctrl/Meta → ×10. Click without drag still focuses for typing.
        this.attributes.add({friendlyName: 'Drag To Change', name: 'dragToChange', type: 'bool', onSet: val => {
            if (val) this.classAdd('sk_ui_input_dragToChange')
            else this.classRemove('sk_ui_input_dragToChange')
        }})
        this.attributes.add({friendlyName: 'Sensitivity', name: 'sensitivity', type: 'number', onSet: val => {
            var n = Number(val)
            this.__sensitivity = (Number.isFinite(n) && n !== 0) ? n : 1
        }})
        this.attributes.add({friendlyName: 'Invert', name: 'invert', type: 'bool'})
        this.__sensitivity = 1
        this.__dragScrubbing = false

        this.input = this.inputBucket.input
        this.input.id = this.element.id + '_input'
        this.__value = ''

        this.inputWrapper = this.inputBucket.inputEl

        this.input.addEventListener('pointerdown', _e => this.onDragToChangePointerDown(_e))
    }

    getDragSensitivity(event){
        var sens = Number(this.sensitivity)
        if (!Number.isFinite(sens) || sens === 0) sens = 1
        if (event) {
            if (event.shiftKey) sens *= 0.1
            if (event.altKey || event.ctrlKey || event.metaKey) sens *= 10
        }
        return sens
    }

    roundDragValue(value, sens){
        var abs = Math.abs(sens)
        if (!(abs > 0)) return Math.round(value)
        if (abs >= 1) return Math.round(value)
        var decimals = Math.min(6, Math.max(0, Math.ceil(-Math.log10(abs) - 1e-9)))
        var f = Math.pow(10, decimals)
        return Math.round(value * f) / f
    }

    clampDragValue(value){
        var next = value
        if (this.min !== undefined && this.min !== null && this.min !== '') {
            var min = parseFloat(this.min)
            if (Number.isFinite(min) && next < min) next = min
        }
        if (this.max !== undefined && this.max !== null && this.max !== '') {
            var max = parseFloat(this.max)
            if (Number.isFinite(max) && next > max) next = max
        }
        return next
    }

    onDragToChangePointerDown(event){
        if (!this.dragToChange) return
        if (event.button !== 0) return
        if (this.input.disabled || this.readonly) return

        var startY = event.clientY
        var startX = event.clientX
        var startVal = parseFloat(this.value)
        if (!Number.isFinite(startVal)) startVal = 0
        var pointerId = event.pointerId
        var scrubbing = false

        var onMove = ev => {
            var dy = startY - ev.clientY
            var dx = ev.clientX - startX
            if (!scrubbing) {
                if (Math.abs(dy) < 3 && Math.abs(dx) < 3) return
                scrubbing = true
                this.__dragScrubbing = true
                this.classAdd('sk_ui_input_dragging')
                try { this.input.setPointerCapture(pointerId) } catch (e) {}
                try { this.input.blur() } catch (e) {}
                document.body.style.cursor = 'ns-resize'
            }
            var sens = this.getDragSensitivity(ev)
            if (this.invert) dy = -dy
            var next = this.clampDragValue(this.roundDragValue(startVal + dy * sens, sens))
            // Bypass string value setter edge cases while scrubbing.
            this.inputBucket.input.value = String(next)
            this.__value = String(next)
            if (this.onChanged) this.onChanged(this.value)
            if (this.onDragToChange) this.onDragToChange(this.value, ev)
        }

        var onUp = ev => {
            window.removeEventListener('pointermove', onMove, true)
            window.removeEventListener('pointerup', onUp, true)
            window.removeEventListener('pointercancel', onUp, true)
            try { this.input.releasePointerCapture(pointerId) } catch (e) {}
            if (scrubbing) {
                this.classRemove('sk_ui_input_dragging')
                document.body.style.cursor = ''
                if (ev && ev.preventDefault) ev.preventDefault()
                // Clear before end callbacks so handlers can format the final value
                // (e.g. 81 → −∞) without a trailing scrub onChanged overwriting them.
                this.__dragScrubbing = false
                if (this.onDragToChangeEnd) this.onDragToChangeEnd(this.value, ev)
                else if (this.onChanged) this.onChanged(this.value)
            } else {
                this.__dragScrubbing = false
            }
        }

        window.addEventListener('pointermove', onMove, true)
        window.addEventListener('pointerup', onUp, true)
        window.addEventListener('pointercancel', onUp, true)
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
        var accepted = '0123456789.,'
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
                    if (destructiveKeys.includes(_e.key)){
                        return
                    } else {
                        if (!controlKeys.includes(_e.key) && !accepted.includes(_e.key)) _e.preventDefault()
                        return
                    }
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