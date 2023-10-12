class sk_ui_menu extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'left top fullwidth'
        this.vertical = false

        this.items = new sk_ui_menuItems()
        this.items.parent = this
    }

    onHandleMenuShown(res){
        this.currentVisibleMenu = res
    }
}

class sk_ui_menuItems extends Array{
    constructor(){
        super()
        this.items = []
    }

    new(cb){
        var item = this.parent.add.simpleButton(_c => {
            _c.classAdd('sk_ui_menuItem')
            _c.text = 'Menu item'
            _c.contextMenu.button = 'left'
            _c.contextMenu.toggle = true
            _c.contextMenu.position = () => { return {x: _c.rect.left, y: _c.rect.top + _c.rect.height} }

            _c.contextMenu.onShow = menu => {
                this.parent.currentVisibleMenu = {item: _c, menu: menu}
            }

            _c.contextMenu.onHide = (opt = {}, menu)=>{
                try { if (!opt.fromGlobal && this.parent.currentVisibleMenu.menu.uuid === menu.uuid) return } catch(err) {}
                delete this.parent.currentVisibleMenu
            }

            _c.element.addEventListener('mouseenter', _e => {
                if (this.parent.currentVisibleMenu){
                    try { if (_e.target.sk_ui_obj.contextMenu.menu.uuid === this.parent.currentVisibleMenu.menu.uuid) return } catch(err) {}
                    
                    sk.ums.broadcast('sk_ui_contextMenu-hide', undefined, {fromGlobal: true, sender: this.menu, excludeSender: true})
        

                    if (!_c.contextMenu.menu) _c.contextMenu.show()
                }
            })
        })

        this.push(item)

        if (cb) cb(item)
    }
}