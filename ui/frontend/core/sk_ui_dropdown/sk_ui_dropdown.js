class sk_ui_dropdown extends sk_ui_button {
    constructor(opt){
        super(opt)

        this._leftIcon = this._icon
        this._leftIcon.style.display = 'none'
        this._leftIcon.classAdd('sk_ui_dropdown_leftIcon')

        this.label.text = ''
        this.label.styling = 'fill left'

        this.compact = true
        
        this._icon = this.add.icon(_c => {
            _c.classAdd('sk_ui_dropdown_rightIcon')
            _c.icon = 'caret down'
        })


        this.contextMenu.button = 'left'
        this.contextMenu.togglable = true

        this.contextMenu.position = opt => {
            var rect = this.rect
            var pos = {x: (rect.x + rect.width/2) - opt.menuRect.width/2, y: rect.y + rect.height}
            return pos
        }
        this.contextMenu.minWidth = ()=> this.rect.width

        this.contextMenu.onItemClicked = itemData => {
            if (!this.ignoreApplyingText) this.text = itemData.label
            if (!this.ignoreApplyingIcon && itemData.icon) this.leftIcon = itemData.icon
            this.selectedItem = itemData
            if (this.onItemClicked) this.onItemClicked(itemData)
            if (this.onItemSelected) this.onItemSelected(itemData)
        }

        this.attributes.add({friendlyName: 'Text', name: 'text', type: 'text', onSet: val => {
            if (this.editableInput) this.editableInput.value = val
            this.setAutoCompleteText('')
        }})

        this.attributes.add({friendlyName: 'Editable', name: 'editable', type: 'bool', onSet: val => {
            if (!this.editableInput) {
                this.editableInputs = this.add.component(_c => {
                    _c.classAdd('sk_ui_dropdown_editableInputs')
                    _c.styling += ' fill'
                })
                this.autoCompleteInput = this.editableInputs.add.input(_c => {
                    _c.type = 'text'
                    _c.disabled = true
                    _c.disableFocus = true
                    _c.classAdd('sk_ui_dropdown_autoComplete')
                    _c.style.display = 'none'
                })
                this.editableInput = this.editableInputs.add.input(_c => {
                    _c.type = 'text'
                    _c.styling += ' fill'
                    _c.style.margin = '0'
                    _c.style.padding = '0'
                    _c.onChanged = value => {
                        this.text = value
                        if (this.onChanged) this.onChanged(value)
                        this.setAutoCompleteText('')
                        if (this.onQuery) this.onQuery({
                            text: value,
                            setAutoCompleteText: text => this.setAutoCompleteText(text)
                        })
                    }
                })
                this.editableInput.input.addEventListener('keydown', event => {
                    if (event.key === 'ArrowDown') {
                        event.preventDefault()
                        event.stopPropagation()
                        if (this.contextMenu.menu) this.contextMenu.menu.focusAdjacentItem(1)
                        else this.contextMenu.show({_e: event, focusFirstItem: true})
                        return
                    }
                    var autoCompleteText = this.autoCompleteInput.value
                    if (event.key !== 'Tab' || !autoCompleteText) return
                    event.preventDefault()
                    this.text = autoCompleteText
                })
                this.editableInput.input.addEventListener('blur', ()=> {
                    if (this.contextMenu.menu) this.contextMenu.menu.close({fromInputBlur: true})
                })
                this.element.insertBefore(this.editableInputs.element, this._icon.element)
                this.editableMenuButton = this.add.component(_c => {
                    _c.classAdd('sk_ui_dropdown_editableMenuButton')
                    _c.add.icon(_c => {
                        _c.icon = 'caret down'
                    })
                })
            }

            this.classRemove('sk_ui_dropdown_editable')
            this.label.style.display = val ? 'none' : ''
            this.editableInputs.style.display = val ? '' : 'none'
            this.editableMenuButton.style.display = val ? '' : 'none'
            this._icon.style.display = val ? 'none' : ''
            if (val) {
                this.classAdd('sk_ui_dropdown_editable')
                this.editableInput.value = this.text || ''
            }
        }})
    }

    setAutoCompleteText(text){
        if (!this.autoCompleteInput) return
        this.autoCompleteInput.value = text || ''
        this.autoCompleteInput.style.display = text ? '' : 'none'
    }

    set items(items){
        this._items = items
        this.contextMenu.items = this._items
    }

    async selectByID(id, identifier = 'id', ignoreOnSelectedFire, propagate){
        var items = this._items
        try { items = await this._items() } catch(err){}

        for (var i in items){
            var item = items[i]
            if (item[identifier] === id){
                this.text = item.label
                if (item.icon) this.leftIcon.icon = item.icon
                this.selectedItem = item
                if (this.onItemSelected && propagate){
                    this.onItemSelected(item, ignoreOnSelectedFire)
                } else {
                    if (!ignoreOnSelectedFire && this.onItemSelected) this.onItemSelected(item, ignoreOnSelectedFire)
                }
                return this.selectedItem
            }
        }
    }

    set leftIcon(val){
        if (!this.__leftIconAccesed){
            this.__leftIconAccesed = true
            this._leftIcon.style.display = ''
        }

        this._leftIcon.icon = val
    }

    get leftIcon(){
        if (!this.__leftIconAccesed){
            this.__leftIconAccesed = true
            this._leftIcon.style.display = ''
        }
        
        return this._leftIcon
    }
}