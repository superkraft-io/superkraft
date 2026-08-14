class sk_ui_label extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.contextMenu.blockPropagation = false

        this.element.innerText = 'Label'

        this.styling = 'left'
        this.editInput = null
        this._endingEdit = false

        this.attributes.add({friendlyName: 'Text', name: 'text', type: 'text', onSet: async val => {
            var setText = () => {
                this.__l10n = undefined
                this.writeContent(val)
            }

            if (!this.fadeOnChange){
                setText()
                return
            }

            this.hideShow_2({onHidden: async ()=>{ return new Promise(resolve => {
                setText()
                resolve()
            })}})
        }})

        this.attributes.add({friendlyName: 'Fade On Change', name: 'fadeOnChange', type: 'bool'})
        
        
        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', units: {max: 50}, css: 'font-size?px'})
        this.attributes.add({friendlyName: 'Weight', name: 'weight', type: 'number', units: {step: 100, min: 0, max: 900}, css: 'font-weight?'})
        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'color', css: 'color?'})
        this.attributes.add({friendlyName: 'Wrap', name: 'wrap', type: 'bool', onSet: val => {
            this.style.whiteSpace = '';
            if (val) this.style.whiteSpace = 'normal'
        }})

        this.attributes.add({friendlyName: 'L10N', name: 'l10n', type: 'text', onSet: val => {
            var phrase = sk.l10n.getPhrase(val)

            if (!phrase){
                console.error(`No localization phrase found for identifier "${val}"`)
                return
            }

            var change = ()=>{
                var asHTML = (phrase.indexOf('!html!') > -1 ? true : false)
                
                if (asHTML){
                    this.vertical = true
                    this.writeContent(phrase.replace('!html!', '').trim(), true)
                } else {
                    this.writeContent(phrase)
                }

                this.__text = phrase
            }

            if (!this.fadeOnChange) return change()

            this.hideShow_2({onHidden: async ()=>{ return new Promise(resolve => {
                change()
                resolve()
            })}})
        }})

        this.attributes.add({friendlyName: 'Editable', name: 'editable', type: 'bool', onSet: val => {
            if (val) {
                this.ensureEditableHost()
                this.bindEditableEvents()
                this.classAdd('sk_ui_label_editable')
            } else {
                this.endEdit(false)
                this.unbindEditableEvents()
                this.classRemove('sk_ui_label_editable')
            }
        }})
    }

    get editing(){
        return !!this.editInput
    }

    contentHost(){
        return this._textHost || this.element
    }

    writeContent(val, asHTML = false){
        var host = this.contentHost()
        try {
            var text = val == null ? '' : String(val)
            if (!asHTML && text.trim().split('\n').length > 1) {
                host.innerHTML = text.split('\n').map(line => {
                    if (line === '') return '<br>'
                    return '<div>' + line + '</div>'
                }).join('')
                if (host === this.element) this.styling = 'top middle ttb'
            } else if (asHTML) {
                host.innerHTML = text
            } else {
                host.innerText = text
            }
        } catch (err) {
            host.innerText = val
        }
    }

    ensureEditableHost(){
        if (this._textHost) return
        var html = this.element.innerHTML
        this.element.innerHTML = ''
        this._textHost = document.createElement('span')
        this._textHost.className = 'sk_ui_label_text'
        this._textHost.innerHTML = html
        this.element.appendChild(this._textHost)
    }

    bindEditableEvents(){
        if (this._editableEventsBound) return
        this._onEditablePointerDown = event => {
            if (!this.editable || this.editing) return
            event.stopPropagation()
        }
        this._onEditableClick = event => {
            if (!this.editable || this.editing) return
            event.stopPropagation()
            event.preventDefault()
            this.beginEdit()
        }
        this.element.addEventListener('pointerdown', this._onEditablePointerDown)
        this.element.addEventListener('click', this._onEditableClick)
        this._editableEventsBound = true
    }

    unbindEditableEvents(){
        if (!this._editableEventsBound) return
        this.element.removeEventListener('pointerdown', this._onEditablePointerDown)
        this.element.removeEventListener('click', this._onEditableClick)
        this._editableEventsBound = false
    }

    beginEdit(seed){
        if (!this.editable || this.editing) return
        this.ensureEditableHost()
        var start = seed
        if (start == null && typeof this.onEditStart === 'function') {
            var fromStart = this.onEditStart()
            if (fromStart === false) return
            start = fromStart
        }
        if (start == null) start = this.text
        if (start === '—') start = ''
        this._editSeed = start == null ? '' : String(start)
        this._endingEdit = false

        this.classAdd('sk_ui_label_editing')
        this.editInput = this.add.input(input => {
            input.classAdd('sk_ui_label_editInput')
            input.compact = true
            input.animate = false
            input.autocomplete = false
            input.value = this._editSeed
        })
        var nativeInput = this.editInput.input
        nativeInput.setAttribute('spellcheck', 'false')
        if (this.editInputMode) nativeInput.setAttribute('inputmode', this.editInputMode)
        nativeInput.addEventListener('keydown', event => {
            event.stopPropagation()
            if (event.key === 'Enter') {
                event.preventDefault()
                this.endEdit(true)
            } else if (event.key === 'Escape') {
                event.preventDefault()
                this.endEdit(false)
            }
        })
        nativeInput.addEventListener('pointerdown', event => event.stopPropagation())
        nativeInput.addEventListener('blur', ()=> this.endEdit(true))

        requestAnimationFrame(()=> {
            if (!this.editInput || !this.editInput.input) return
            this.editInput.input.focus({preventScroll: true})
            this.editInput.input.select()
        })
    }

    endEdit(commit){
        if (!this.editInput || this._endingEdit) return
        this._endingEdit = true
        var raw = this.editInput.value
        var seed = this._editSeed
        this.editInput.remove()
        this.editInput = null
        this.classRemove('sk_ui_label_editing')
        this._endingEdit = false

        if (commit) {
            if (typeof this.onEditCommit === 'function') {
                var next = this.onEditCommit(raw, seed)
                if (typeof next === 'string') this.text = next
            } else {
                this.text = raw
            }
        } else if (typeof this.onEditCancel === 'function') {
            this.onEditCancel(seed)
        }
    }
}
