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

        this.contextMenu.onItemClicked = itemData => {
            if (!this.ignoreApplyingText) this.text = itemData.label
            if (!this.ignoreApplyingIcon && itemData.icon) this.leftIcon = itemData.icon
            this.selectedItem = itemData
            if (this.onItemClicked) this.onItemClicked(itemData)
            if (this.onItemSelected) this.onItemSelected(itemData)
        }
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