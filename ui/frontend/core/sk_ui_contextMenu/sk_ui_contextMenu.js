class SK_ContextMenu {
    constructor(opt){
        this.opt = opt
        this.parent = opt.parent

        this.activeWhenParentDisabled = false
        this.__button = 'right'
    }

    set items(val){
        if (!this.__items) this.setEventListener()
        this.__items = val
    }

    get items(){ return this.__items }

    set button(val){ this.__button = val }

    setEventListener(){
        var shouldIgnore = path => {
            if (this.parent.element.id === path[0].id) return false

            if (path[0].tagName === 'INPUT') return true

            for (var i in path){
                var element = path[i]
                
                try {
                    var suo = element.sk_ui_obj
                    var cm = suo.contextMenu
                    if (this.parent.element.id === element.id) return false
                    if (cm.items) return true
                    if (cm.blockPropagation) return true
                } catch(err) {
                }
            }

            return
        }

        this.parent.element.addEventListener('contextmenu', _e => {
            if (shouldIgnore(_e.path)) return
            _e.preventDefault()
            if (this.__button === 'right') this.handleMouseEvent(_e)
        })
        this.parent.element.addEventListener('click', _e => { if (this.__button === 'left') this.handleMouseEvent(_e) })
    }

    handleMouseEvent(_e){
        if (this.parent.disabled && !this.activeWhenParentDisabled) return
        this.show({_e: _e})
    }

    show(opt){
        var items = undefined
        
        if (this.__items instanceof Function){
            items = this.__items()
        } else {
            items = this.__items
        }

        if (!items) return console.error('Cannot show context menu with empty items list')

        if (this.menu){
            this.menu.remove()
            this.menu = undefined
            return
        }

        this.menu = sk.app.add.contextMenu(_c => {
            _c.cmParent = this
            _c.items = items
            _c.position = this.position || {x: opt._e.clientX, y: opt._e.clientY}
            _c.show()
        })



        if (this.highlightParent) this.parent.classAdd('sk_ui_contextMenu_Item_highlightParent')
    }

    onMenuHide(){
        this.parent.classRemove('sk_ui_contextMenu_Item_highlightParent')
        this.menu = undefined
    }
}

class sk_ui_contextMenu extends sk_ui_component {
    constructor(opt){
        super(opt)
        this.compact = true

        this.ums.on('sk_ui_contextMenu', res => {
            if (res.first) return

            var data = res.data

            if (data.hide) this.remove()
        })

        this.element.addEventListener('mouseenter', _e => {
            this.focused = true
        })

        this.element.addEventListener('mouseleave', _e => {
            this.focused = false
        })

        this.element.addEventListener('mousedown', _e => {
            _e.stopPropagation()
        })
    }

    set items(val){
        this.__items = val
    }

    show(opt){
        return new Promise(async resolve => {
            this.assemble()
            this.configIconOffset()
            this.style.left = this.position.x + 'px'
            this.style.top = this.position.y + 'px'
            await this.transition('fade in')
            resolve()
        })
    }

    async onBeforeRemove(opt){
        return new Promise(async resolve => {
            this.transition('fade out')
            if (this.cmParent.onMenuHide) this.cmParent.onMenuHide()
            resolve()
        })
    }

    assemble(){
        this.sk_items = []
        for (var i in this.__items){
            var item = this.__items[i]
            this.sk_items.push(
                this.add.fromNew(sk_ui_contextMenu_Item, _c => {
                    _c.config(item)
                })
            )
        }
    }

    closeSubmenus(opt = {}){
        for (var i in this.sk_items){
            var item = this.sk_items[i]
            if (item.submenu && item.uuid !== opt.ignore.uuid) item.closeSubmenu({force: true})
        }
    }

    hasAnySubmenusOpen(){
        for (var i in this.sk_items){
            var item = this.sk_items[i]
            if (item.hasAnySubmenusOpen()) return true
        }
    }

    anyItemHasIcon(){
        for (var i in this.sk_items){
            var item = this.sk_items[i]
            if (item.hasIcon) return true
        }
    }
    configIconOffset(){
        if (!this.anyItemHasIcon()) return
        for (var i in this.sk_items){
            var item = this.sk_items[i]
            item.leftSide.iconContainer.classAdd('sk_ui_contextMenu_Item_hasIcon')
        }
    }
}

class sk_ui_contextMenu_Item extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'left middle'
        this.compact = true

        this.leftSide = this.add.component(_c => {
            _c.classAdd('sk_ui_contextMenu_Item_leftSide')
            _c.vertical = false
            _c.iconContainer = _c.add.component()
        })

        this.content = this.add.component(_c => {
            _c.classAdd('sk_ui_contextMenu_Item_content')
            _c.vertical = false
            _c.styling = 'left middle fill'
        })

        this.rightSide = this.add.component(_c => {
            _c.classAdd('sk_ui_contextMenu_Item_rightSide')
            _c.vertical = false
            
        })
    }

    onBeforeRemove(){
        return new Promise(resolve => {
            this.classAdd('sk_ui_ignoreMouse')
            this.closeSubmenu()
            resolve()
        })
    }

    set items(val){
        this.__items = val
    }

    config(opt){
        this.opt = opt
        if (opt.separator) this.as_separator()
        else if (opt.header) this.as_header()
        else this.as_item()
    }

    as_item(){
        if (!this.opt.disabled){
            this.classAdd('sk_ui_contextMenu_Item_enabled sk_ui_contextMenu_Item_interactable')
        } 

        this.content.add.label(_c => {
            _c.text = this.opt.label
        })

        if (this.opt.items){
            this.rightSide.add.icon(_c => {
                _c.icon = 'chevron right icon'
            })
        }

        if (this.opt.icon){
            if (/\p{Emoji}/u.test(this.opt.icon)){
                this.leftSide.iconContainer.add.label(_c => {
                    _c.text = this.opt.icon
                })
                this.hasIcon = true
            } else {
                this.leftSide.iconContainer.add.icon(_c => {
                    _c.icon = this.opt.icon
                })
                this.hasIcon = true
            }
        }

        

        this.element.addEventListener('mouseup', _e => {
            if (this.opt.items) return _e.stopPropagation()
            this.opt.onClick(this)
        })

        if (this.opt.items){
            this.classRemove('sk_ui_contextMenu_Item_interactable')

            this.element.addEventListener('mouseleave', _e => {
                setTimeout(()=>{
                    this.closeSubmenu()
                }, 10)
            })
        }
            
        this.element.addEventListener('mouseenter', _e => {
            this.closeSubmenu({level: 1})
            
            this.parent.closeSubmenus({ignore: this})

            if (!this.opt.items || this.submenu) return


            this.classAdd('sk_ui_contextMenu_Item_submenuExpanded')

            var rect = this.rect

            this.submenu = sk.app.add.contextMenu(async _c => {
                _c.cmParent = this
                _c.isSubmenu = true
                _c.items = this.opt.items
                _c.position = {x: rect.left + rect.width, y: rect.top - 6}
                await _c.show()
                _c.canClose = true
            })
        })
    }

    as_header(){
        this.classAdd('sk_ui_contextMenu_Item_Header')

        this.content.add.label(_c => {
            _c.text = this.opt.header
        })
    }

    as_separator(){
        this.classAdd('sk_ui_contextMenu_Item_Separator')
    }

    closeSubmenu(opt = {}){
        if (!this.submenu) return
        if (!opt.force){
            if (this.submenu.focused) return
            if (!this.submenu.canClose) return
        }
        




        var level = opt.level || 0
        if (level > 0){
            this.submenu.closeSubmenus({ignore: this})
            return
        }

        this.submenu.remove()
        this.submenu = undefined
        this.classRemove('sk_ui_contextMenu_Item_submenuExpanded')
    }

    hasAnySubmenusOpen(){
        if (this.submenu) return this.submenu.hasAnySubmenusOpen()
    }
}