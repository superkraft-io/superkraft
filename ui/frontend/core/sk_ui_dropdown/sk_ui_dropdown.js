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


        this._menuEnabled = true
        this._menuButton = 'left'
        this.contextMenu.button = 'left'
        this.contextMenu.toggle = true

        this.contextMenu.position = opt => {
            var rect = this.rect
            var pos = {x: (rect.x + rect.width/2) - opt.menuRect.width/2, y: rect.y + rect.height}
            return pos
        }
        this.contextMenu.minWidth = ()=> this.rect.width

        this.contextMenu.onItemClicked = itemData => {
            if (!this.ignoreApplyingText) this.text = itemData.label
            // Synthetic selection checks stay in the menu only.
            if (!this.ignoreApplyingIcon && itemData.icon
                && !(this.checkmarkOnSelected && itemData.icon === 'check')) {
                this.leftIcon = itemData.icon
            }
            this.selectedItem = itemData
            if (this.onItemClicked) this.onItemClicked(itemData)
            if (this.onItemSelected) this.onItemSelected(itemData)
        }

        var contextMenuShow = this.contextMenu.show.bind(this.contextMenu)
        this.contextMenu.show = opt => {
            if (!this._menuEnabled) return
            return contextMenuShow(opt)
        }

        this.attributes.add({friendlyName: 'Text', name: 'text', type: 'text', onSet: val => {
            if (this.editableInput) this.editableInput.value = val
            this.setAutoCompleteText('')
        }})

        this.attributes.add({friendlyName: 'Menu enabled', name: 'menuEnabled', type: 'bool', onSet: val => {
            this._menuEnabled = val !== false
            if (this._menuEnabled) {
                this.contextMenu.button = this._menuButton || 'left'
            } else {
                if (this.contextMenu.button && this.contextMenu.button !== 'none') {
                    this._menuButton = this.contextMenu.button
                }
                this.contextMenu.button = 'none'
                if (this.contextMenu.menu) {
                    this.contextMenu.menu.close({fromThis: true})
                    this.contextMenu.menu = undefined
                }
            }
        }})

        // When true, the open menu shows a check icon on the current selectedItem.
        this.attributes.add({friendlyName: 'Checkmark on selected', name: 'checkmarkOnSelected', type: 'bool', onSet: ()=> {
            this.syncContextMenuItems()
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
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        if (!this._menuEnabled) return
                        event.preventDefault()
                        event.stopPropagation()
                        var dir = event.key === 'ArrowDown' ? 1 : -1
                        var menu = this.activeMenu()
                        if (menu) {
                            menu.focusAdjacentItem(dir)
                            return
                        }
                        var shown = this.contextMenu.show({_e: event, focusFirstItem: dir === 1})
                        if (dir === -1 && shown && typeof shown.then === 'function') {
                            shown.then(() => {
                                var opened = this.contextMenu.menu
                                if (!opened) return
                                var items = opened.getNavigableItems()
                                if (items.length) opened.focusItem(items[items.length - 1])
                            })
                        }
                        return
                    }
                    if (event.key === 'ArrowRight') {
                        var rightMenu = this.activeMenu()
                        var rightItem = rightMenu && rightMenu.keyboardFocusedItem
                        if (rightItem && rightItem.openSubmenu) {
                            event.preventDefault()
                            event.stopPropagation()
                            rightItem.openSubmenu(true)
                        }
                        return
                    }
                    if (event.key === 'ArrowLeft') {
                        var leftMenu = this.activeMenu()
                        if (leftMenu && leftMenu.parentContextMenu) {
                            event.preventDefault()
                            event.stopPropagation()
                            var parentMenu = leftMenu.parentContextMenu
                            var parentItem = leftMenu.parentItem
                            leftMenu.close({fromKeyboard: true})
                            if (parentMenu) parentMenu.focusItem(parentItem)
                        }
                        return
                    }
                    if (event.key === 'Enter') {
                        event.preventDefault()
                        event.stopPropagation()
                        if (this.activateFocusedMenuItem()) {
                            event.stopImmediatePropagation()
                            return
                        }
                    }
                    var tabComplete = this.autoCompleteInput.value
                    if (event.key !== 'Tab' || !tabComplete) return
                    event.preventDefault()
                    this.text = tabComplete
                    if (this.onChanged) this.onChanged(tabComplete)
                    this.setAutoCompleteText('')
                    if (this.onQuery) this.onQuery({
                        text: tabComplete,
                        setAutoCompleteText: text => this.setAutoCompleteText(text)
                    })
                })
                this.editableInput.element.addEventListener('mousedown', event => event.stopPropagation())
                this.editableInput.element.addEventListener('click', event => event.stopPropagation())
                this.element.addEventListener('mouseenter', ()=> {
                    if (this.contextMenu.menu) this.contextMenu.menu.focused = true
                })
                this.editableInput.input.addEventListener('blur', ()=> {
                    var menu = this.contextMenu.menu
                    if (!menu) return
                    setTimeout(()=> {
                        if (this.pointerOverMenu()) return
                        var open = this.contextMenu.menu
                        if (open) open.close({fromInputBlur: true})
                    }, 0)
                })
                this.element.insertBefore(this.editableInputs.element, this._icon.element)
                this.editableMenuButton = this.add.component(_c => {
                    _c.classAdd('sk_ui_dropdown_editableMenuButton')
                    this.editableMenuButtonIcon = _c.add.icon(_c => {
                        _c.icon = this._editableMenuIcon || 'caret down'
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
                if (this.editableMenuButtonIcon) {
                    this.editableMenuButtonIcon.icon = this._editableMenuIcon || 'caret down'
                }
            }
        }})

        this.attributes.add({friendlyName: 'Editable menu icon', name: 'editableMenuIcon', type: 'text', onSet: val => {
            this._editableMenuIcon = val || 'caret down'
            if (this.editableMenuButtonIcon) this.editableMenuButtonIcon.icon = this._editableMenuIcon
        }})

        // Alias: autocomplete=true turns on the editable field + ghost suggestion.
        this.attributes.add({friendlyName: 'Autocomplete', name: 'autocomplete', type: 'bool', onSet: val => {
            this.editable = !!val
        }})
    }

    setAutoCompleteText(text){
        if (!this.autoCompleteInput) return
        this.autoCompleteInput.value = text || ''
        this.autoCompleteInput.style.display = text ? '' : 'none'
    }

    activeMenu(){
        if (typeof sk_ui_contextMenu !== 'undefined' && sk_ui_contextMenu.activeKeyboardMenu) {
            return sk_ui_contextMenu.activeKeyboardMenu
        }
        return this.contextMenu.menu
    }

    pointerOverMenu(){
        if (this.element && this.element.matches && this.element.matches(':hover')) return true
        try {
            if (document.querySelector('.sk_ui_contextMenu:hover')) return true
        } catch (err) {}
        var menu = this.contextMenu.menu
        return !!(menu && menu.focused)
    }

    activateFocusedMenuItem(){
        var menu = this.activeMenu()
        var item = menu && menu.keyboardFocusedItem
        if (!item || !item.activate) return false
        item.activate()
        return true
    }

    set items(items){
        this._items = items
        this.syncContextMenuItems()
    }

    get items(){
        return this._items
    }

    syncContextMenuItems(){
        if (this.checkmarkOnSelected) {
            this.contextMenu.items = ()=> this.menuItemsWithSelectionCheck()
        } else {
            this.contextMenu.items = this._items
        }
    }

    async menuItemsWithSelectionCheck(){
        var items = this._items
        try { items = await this._items() } catch(err){}
        items = items || []
        var sel = this.selectedItem
        if (!sel) return items
        return items.map(item => {
            var selected = (item.id !== undefined && sel.id !== undefined)
                ? item.id === sel.id
                : item === sel
            if (!selected) return item
            return Object.assign({}, item, {icon: 'check'})
        })
    }

    async selectByID(id, identifier = 'id', ignoreOnSelectedFire, propagate){
        var items = this._items
        try { items = await this._items() } catch(err){}

        for (var i in items){
            var item = items[i]
            if (item[identifier] === id){
                this.text = item.label
                if (item.icon && !this.ignoreApplyingIcon
                    && !(this.checkmarkOnSelected && item.icon === 'check')) {
                    this.leftIcon.icon = item.icon
                }
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
