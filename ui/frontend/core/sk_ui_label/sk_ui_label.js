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

        // A text longer than its room keeps its start and its last ellipsisTail characters, cut close to the end
        // ("Voice Cleaner Ul…a HQ"), left-aligned. isTruncated says when it is; the cut follows the room.
        this.ellipsisTail = 4
        this.attributes.add({friendlyName: 'Ellipsis', name: 'ellipsis', type: 'bool', onSet: val => {
            this._ellipsis = !!val
            this.element.classList.toggle('sk_ui_label_ellipsis', this._ellipsis)
            if (this._ellipsis) this.watchEllipsisRoom()
            else if (this._ellipsisObserver) {
                this._ellipsisObserver.disconnect()
                this._ellipsisObserver = null
            }
            this.fitEllipsis()
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
        this._fullText = null
        try {
            var text = val == null ? '' : String(val)
            if (!asHTML && text.trim().split('\n').length > 1) {
                // One div per line, as text: names and paths reach labels (file names can hold markup).
                host.textContent = ''
                text.split('\n').forEach(line => {
                    if (line === '') return host.appendChild(document.createElement('br'))
                    var div = document.createElement('div')
                    div.textContent = line
                    host.appendChild(div)
                })
                if (host === this.element) this.styling = 'top middle ttb'
            } else if (asHTML) {
                host.innerHTML = text
            } else {
                host.innerText = text
                this._fullText = text
                if (this._ellipsis) this.fitEllipsis()
            }
        } catch (err) {
            host.innerText = val
        }
    }

    // The room is the label's width with the whole text in it; the head grows by halving until it no longer fits.
    fitEllipsis(){
        var full = this._fullText
        var host = this.contentHost()
        var el = this.element
        if (full == null || this.editing) return
        host.textContent = full
        this.isTruncated = false
        if (!this._ellipsis || !el.isConnected) return
        var room = el.clientWidth
        if (!room || el.scrollWidth <= room) return

        var tail = Math.max(0, Math.min(this.ellipsisTail, full.length - 1))
        var end = full.slice(full.length - tail)
        var fits = n => {
            host.textContent = full.slice(0, n).trimEnd() + '…' + end
            return el.scrollWidth <= room
        }
        var lo = 0
        var hi = full.length - tail - 1
        while (lo < hi){
            var mid = Math.ceil((lo + hi) / 2)
            if (fits(mid)) lo = mid
            else hi = mid - 1
        }
        fits(lo)
        this.isTruncated = true
    }

    // Its own size (laid out, fonts in) and its parent's (a cut label doesn't grow with the room it got back).
    watchEllipsisRoom(){
        if (this._ellipsisObserver || typeof ResizeObserver === 'undefined') return
        this._ellipsisObserver = new ResizeObserver(()=> {
            var parent = this.element.parentElement
            if (parent && parent !== this._ellipsisParent){
                if (this._ellipsisParent) this._ellipsisObserver.unobserve(this._ellipsisParent)
                this._ellipsisParent = parent
                this._ellipsisObserver.observe(parent)
            }
            this.fitEllipsis()
        })
        this._ellipsisObserver.observe(this.element)
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
