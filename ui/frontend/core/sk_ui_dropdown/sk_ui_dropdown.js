class sk_ui_dropdown extends sk_ui_button {
    constructor(opt){
        super(opt)

        this._icon.remove()

        this.label.text = ''
        this.label.styling = 'fill left'

        this.compact = true
        
        this._icon = this.add.icon(_c => {
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
            this.selectedItem = itemData
            if (this.onItemClicked) this.onItemClicked(itemData)
            if (this.onItemSelected) this.onItemSelected(itemData)
        }

    }

    set items(items){
        this._items = items
        this.contextMenu.items = this._items
    }

    selectByID(id, identifier = 'id'){
        for (var i in this._items){
            var item = this._items[i]
            if (item[identifier] === id){
                this.text = item.label
                this.selectedItem = item
                if (this.onItemSelected) this.onItemSelected(item)
                return
            }
        }
        
    }
}