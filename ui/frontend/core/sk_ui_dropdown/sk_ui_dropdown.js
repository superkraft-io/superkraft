class sk_ui_dropdown extends sk_ui_button {
    constructor(parent){
        super(parent)

        this._icon.remove()

        this.label.styling = 'fill left'

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
                    if (this.onItemClicked) this.onItemClicked(item)
                }
            })
        }
    }

    set items(items){ this._items = items }
}