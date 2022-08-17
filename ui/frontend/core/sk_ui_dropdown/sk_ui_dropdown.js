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

        this.onClick = ()=>{
            if (this.menu){
                this.menu.hide()
                this.menu = undefined
                
                return
            }

            var rect = this.rect
            this.menu = sk._cM.show({
                toggle: true,
                pos: {x: rect.x, y: rect.y + rect.height - 14},
                sender: this.element,
                items: this._items || {},
                onItemClicked: item => {
                    this.text = item.label
                    this.selectedItem = item
                    if (this.onItemClicked) this.onItemClicked(item)
                }
            })
        }
    }

    set items(items){ this._items = items }

    selectByID(id, identifier = 'id'){
        for (var i in this._items){
            var item = this._items[i]
            if (item[identifier] === id){
                this.text = item.label
                this.selectedItem = item
                return
            }
        }
        
    }
}