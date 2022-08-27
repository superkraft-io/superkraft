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
            this.menu.close()
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


class sk_ui_contextMenu_shortcut extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.vertical = false
        this.compact = true
    }

    setCombination(val){
        var split = val.toLowerCase().split('+')

        var specialCharacters = '^fn⇧⌥alt⌘'

        var addSpecial = val => {
            this.add.label(_c => {
                _c.classAdd('sk_ui_contextMenu_shortcut_specialChar')
                _c.text = val
            })
        }
        if (split.includes('^'))     addSpecial('^')
        if (split.includes('fn'))    addSpecial('fn')
        if (split.includes('shift')) addSpecial('⇧')
        if (split.includes('alt') || split.includes('option')) addSpecial((sk.os === 'darwin' ? '⌥' : 'Alt'))
        if (split.includes('cmd') || split.includes('command')) addSpecial('⌘')

        var last = split[split.length - 1]
        
        if (specialCharacters.indexOf(last) > -1) return

        this.add.label(_c => {
            _c.text = last.toUpperCase()
        })
    }
}


class sk_ui_contextMenu extends sk_ui_component {
    constructor(opt){
        super(opt)
        this.compact = true

        this.menuChain = ''

        this.ums.on('sk_ui_contextMenu', res => {
            if (res.first) return

            var data = res.data

            if (data.hide) this.close()
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

    async onBeforeRemove(opt){
        return new Promise(async resolve => {
            if (this.cmParent && this.cmParent.onMenuHide) this.cmParent.onMenuHide()
            await this.transition('fade out')
            resolve()
        })
    }

    close(){
        if (this.parentItem) this.parentItem.classRemove('sk_ui_contextMenu_Item_submenuExpanded')
        this.closeSubmenus()
        this.remove()
    }


    calcPos(){
        var appRect = sk.app.rect
        var menuRect = this.rect


        

        if (this.position.x + menuRect.width > appRect.width){
            this.expandLeftwards = true
            this.position.x = appRect.width - menuRect.width
        }

        if (this.position.y + menuRect.height > appRect.height){
            this.position.y = appRect.height - menuRect.height
        }

        if (!this.isSubmenu) return

        var parentItemRect = this.parentItem.rect

        var rangesIntersect = (a, b)=>{
            if (a.min >= b.max || a.max <= b.min) return false
            return true
        }
        
        if (
            rangesIntersect(
                {
                    min: this.position.x,
                    max: this.position.x + menuRect.width
                },
                
                {
                    min: parentItemRect.left,
                    max: parentItemRect.left + parentItemRect.width
                }
            )
        ){
            this.submenuDirection = 'left'
            this.position.x = parentItemRect.left - menuRect.width
        }
    }

    show(opt){
        return new Promise(async resolve => {

            if (this.parentItem) this.parentItem.classAdd('sk_ui_contextMenu_Item_submenuExpanded')

            this.assemble()

            this.configIconOffset()

            this.calcPos()

            this.classAdd('sk_ui_contextMenu_activated')
            
            this.style.left = this.position.x + 'px'
            this.style.top = this.position.y + 'px'
            this.style.opacity = 0
            
            setTimeout(()=>{ this.style.opacity = 1 }, 10)

            await this.transition('fade in')

            this.canClose = true

            resolve()
        })
    }

    

    assemble(){
        if (this.isSubmenu){
            this.menuChain += ' sk_ui_contextMenu_submenu_of_' + this.parentMenu.uuid
            this.classAdd(this.menuChain)
        }


        this.sk_items = []
        for (var i in this.__items){
            var item = this.__items[i]
            this.sk_items.push(
                this.add.fromNew(sk_ui_contextMenu_Item, _c => {
                    _c.parentMenu = this
                    _c.config(item)
                })
            )
        }
    }

    closeSubmenus(opt = {}){
        
        document.querySelectorAll('.sk_ui_contextMenu_submenu_of_' + this.uuid).forEach(_c => {
            if (opt.ignore && opt.ignore === _c.sk_ui_obj.uuid) return
            clearTimeout(_c.sk_ui_obj.showTimer)
            _c.sk_ui_obj.close()
        })
        /*
        for (var i in this.sk_items){
            var item = this.sk_items[i]
            if (item.submenu && item.uuid !== opt.ignore.uuid){
                document.querySelectorAll('.sk_ui_contextMenu_submenu_of_' + this.uuid).forEach(_c => {
                    _c.sk_ui_obj.close()
                })
            }
        }*/

        return
        for (var i in this.sk_items){
            var item = this.sk_items[i]
            if (item.submenu && item.uuid !== opt.ignore.uuid) item.closeSubmenu({force: true})
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

    get submenu(){
        var _q = document.querySelector('.sk_ui_contextMenu_submenu_of_' + this.submenuID)
        if (!_q) return
        var el = _q[0]
        if (!el) return
        return el.sk_ui_obj
    }

    

    onBeforeRemove(){
        return new Promise(resolve => {
            if (this.submenu) this.submenu.classAdd('sk_ui_ignoreMouse')
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

        /*if (this.opt.shortcut && !this.opt.items){
            this.rightSide.add.fromNew(sk_ui_contextMenu_shortcut, _c => {
                _c.setCombination(this.opt.shortcut)
            })
        }*/

        

        this.element.addEventListener('mouseup', _e => {
            if (!this.parent.canClose) return
            if (this.opt.items) return _e.stopPropagation()
            this.opt.onClick(this)
            sk.ums.broadcast('sk_ui_contextMenu', undefined, {hide: true})
        })

        if (this.opt.items){
            this.classRemove('sk_ui_contextMenu_Item_interactable')

            this.element.addEventListener('mouseleave', _e => {
                clearTimeout(this.showTimer)

                this.closeTimer = setTimeout(()=>{

                    var submenu = this.submenu
                    if (submenu && !submenu.focused){
                        submenu.close()
                    }
                }, 100)
            })
        }
        
            
        this.element.addEventListener('mouseenter', _e => {
            this.parentMenu.closeSubmenus({ignore: this.submenuID})
            if (!this.opt.items) return
            if (this.submenu) return

            var rect = this.rect

            clearTimeout(this.closeTimer)
            clearTimeout(this.showTimer)
            sk.app.add.contextMenu(async _c => {
                this.submenuID = _c.uuid
                _c.parentMenu = this.parentMenu
                _c.parentItem = this
                _c.isSubmenu = true
                _c.submenuDirection = this.parent.submenuDirection
                _c.items = this.opt.items
                _c.position = {x: rect.left + rect.width, y: rect.top - 6}
                
                this.showTimer = setTimeout(()=>{
                    _c.show()
                }, 150)
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
}