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


    set position(val){
        this.__position = val
    }

    get position(){ return this.__position }

    set button(val){ this.__button = val }


    setup(cb){
        cb(this)
    }

    
    getElPath(_el){
        var path = [];
        var currentElem = _el;
        while (currentElem) {
            path.push(currentElem);
            currentElem = currentElem.parentElement;
        }
        if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
            path.push(document);
        if (path.indexOf(window) === -1)
            path.push(window);
        return path;
    }

    shouldIgnore(parent, path){
        if (parent.element.id === path[0].id) return false

        if (path[0].tagName === 'INPUT') return true

        for (var i in path){
            var element = path[i]
            
            try {
                var suo = element.sk_ui_obj
                var cm = suo.contextMenu
                if (parent.element.id === element.id) return false
                if (cm.items) return true
                if (cm.blockPropagation) return true
            } catch(err) {
            }
        }

        return
    }
    
    setEventListener(){
        

        this.parent.element.addEventListener('contextmenu', _e => {
            _e.stopPropagation()
            _e.preventDefault()
            if (this.shouldIgnore(this.parent, this.getElPath(_e.currentTarget))) return
            if (this.__button === 'right') this.handleMouseEvent(_e)
        })

        this.parent.onClick = _e => {
            _e.stopPropagation()
            _e.preventDefault()
            if (this.__button === 'left') this.handleMouseEvent(_e)
        }

        this.parent.element.addEventListener('mousedown', _e => {
            if (this.stopPropagation) _e.stopPropagation()
        })

        this.parent.element.addEventListener('mouseup', _e => {
            if (this.stopPropagation) _e.stopPropagation()
        })
    }

    handleMouseEvent(_e){
        _e.stopPropagation()

        //sk.ums.broadcast('sk_ui_contextMenu-hide', undefined, {fromGlobal: true, sender: this.menu})
        
        if (this.parent.disabled && !this.activeWhenParentDisabled) return
        if (this.toggle){
            if (this.menu){
                this.menu.close({fromThis: true})
                this.menu = undefined
            }
        }

        this.show({_e: _e})
    }

    async show(opt){
        var items = undefined

        
        
        if (this.__items instanceof Function){
            items = await this.__items()
        } else {
            items = this.__items
        }

        if (!items) return console.error('Cannot show context menu with empty items list')

        if (this.skipOnce){
            this.skipOnce = false
            return
        }

        if (this.menu && !this.toggle){
            this.menu.close()
            this.menu = undefined
        }

        this.menu = sk.app.add.contextMenu(_c => {
            _c.cmParent = this
            _c.items = items
            _c.position = this.__position || {x: opt._e.clientX, y: opt._e.clientY}
            
        })

        sk.menus.push(this.menu)

        
        this.menu.show(opt)

        //sk.ums.broadcast('sk_ui_contextMenu-hide', undefined, {fromGlobal: true, sender: this.menu, excludeSender: true})
        


        if (this.highlightParent) this.parent.classAdd('sk_ui_contextMenu_Item_highlightParent')

        if (this.onShow) this.onShow(this.menu)
    }

    onMenuHide(opt){
        this.parent.classRemove('sk_ui_contextMenu_Item_highlightParent')
        
        if (this.toggle){
            if (opt){
                if (opt.fromThis && !this.skipOnce) this.skipOnce = true
                if (this.menu && opt.sender  && opt.sender.uuid === this.menu.uuid) this.skipOnce = true
            }
        }
        
        
        if (this.onHide) this.onHide(opt, this.menu)

        this.menu = undefined

    }

    _onItemClicked(item){
        if (this.onItemClicked) this.onItemClicked(item)
    }
}


class sk_ui_contextMenu_shortcut extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.vertical = false
        this.compact = true
    }

    setCombination(val){
        var shortcutStr = val
        if (typeof val === 'object') shortcutStr = (sk.os === 'macos' ? val.macos : val.win)
        var split = shortcutStr.toLowerCase().split('+')

        var specialCharacters = '^fn⇧⌥ctrlalt⌘'

        var plusChar = undefined

        var addSpecial = val => {
            this.add.label(_c => {
                _c.classAdd('sk_ui_contextMenu_shortcut_specialChar')
                _c.text = val
            })

            plusChar = this.add.label(_c => {
                _c.classAdd('sk_ui_contextMenu_shortcut_specialChar')
                _c.text = '+'
            })
        }
        if (split.includes('^'))     addSpecial('^')
        if (split.includes('ctrl')) addSpecial('Ctrl')
        if (split.includes('shift')) addSpecial((sk.os === 'macos' ? '⇧' : 'Shift'))
        if (split.includes('alt') || split.includes('option')) addSpecial((sk.os === 'macos' ? '⌥' : 'Alt'))
        if (split.includes('cmd') || split.includes('command')) addSpecial('⌘')

        var last = split[split.length - 1]
        
        //plusChar.remove()
        //if (specialCharacters.indexOf(last) > -1) return

        this.add.label(_c => {
            _c.text = last.toUpperCase()
        })
    }
}


class sk_ui_contextMenu extends sk_ui_component {
    constructor(opt){
        super(opt)
        this.compact = true
        this.frosted = 'clear'

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

        
        this.ums.on('sk_ui_contextMenu-hide', val => {
            if (val.data.sender && val.data.sender.uuid && val.data.excludeSender) return
            if (val.first) return

            if (val.data.instant) this.closeInstantly = true
            this.close(val.data)

            for (var i in sk.menus){
                var menu = sk.menus[i]
                menu.remove()
            }

            var open_contextMenus = document.querySelectorAll('.sk_ui_contextMenu')
            for (var i = 0; i < open_contextMenus.length; i++) open_contextMenus[i].sk_ui_obj.remove()

            sk.menus = []
        })
    }

    set items(val){
        this.__items = val
    }

    set position(val){
        this.__position = val
    }

    get position(){
        if (this.__position instanceof Function){
            return this.__position({menuRect: this.rect})
        } else {
            return this.__position
            
            /*if (this.__position === undefined) this.__position = 'bottom left'

            var finalPos = this.__position

            var x_positions = ['left', 'center', 'right']
            var y_positions = ['top', 'middle', 'bottom']
            
            
            if (x_positions.includes(this.__position) || y_positions.includes(this.__position)){
                var positions = this.__position.split(' ')
                
                var x_pos = 'left'
                var y_pos = 'bottom'

                if (x_positions.includes(positions[0])) x_pos = positions[0]
                if (x_positions.includes(positions[1])) x_pos = positions[1]

                if (y_positions.includes(positions[0])) y_pos = positions[0]
                if (y_positions.includes(positions[1])) y_pos = positions[1]

                var mappedPosX = 0
                var mappedPosY = 0

                var parentRect = this.parent.rect

                if (x_pos === 'center') mappedPosX = (rect.x + rect.width/2) - opt.menuRect.width/2

                finalPos = {
                    x: ,
                    y: 
                }
            }

            return finalPos*/
        }
    }

    async onBeforeRemove(opt){
        return new Promise(async resolve => {
            if (this.cmParent && this.cmParent.onMenuHide) this.cmParent.onMenuHide(this.closeOpt)
            if (!this.closeInstantly){ await this.transition('fade out') }
           
            resolve()
        })
    }

    close(opt){
        this.closeOpt = opt
        if (this.parentItem) this.parentItem.classRemove('sk_ui_contextMenu_Item_submenuExpanded')
        this.closeSubmenus()
        this.remove()
    }


    calcPos(){
        var appRect = sk.app.rect
        var menuRect = this.rect


        var position = this.position
        

        if (position.x + menuRect.width > appRect.width){
            this.expandLeftwards = true
            position.x = appRect.width - menuRect.width
        }

        if (position.y + menuRect.height > appRect.height){
            position.y = appRect.height - menuRect.height
        }

        if (position.y < 0){
            position.y = 0
        }

        this.__adjustedPosition = position

        if (!this.isSubmenu) return

        var parentItemRect = this.parentItem.rect

        var rangesIntersect = (a, b)=>{
            if (a.min >= b.max || a.max <= b.min) return false
            return true
        }
        
        if (
            rangesIntersect(
                {
                    min: position.x,
                    max: position.x + menuRect.width
                },
                
                {
                    min: parentItemRect.left,
                    max: parentItemRect.left + parentItemRect.width
                }
            )
        ){
            this.submenuDirection = 'left'
            position.x = parentItemRect.left - menuRect.width
        }

        this.__adjustedPosition = position
    }

    show(opt = {}){
        return new Promise(async resolve => {

            if (this.parentItem) this.parentItem.classAdd('sk_ui_contextMenu_Item_submenuExpanded')

            this.assemble()

            this.configIconOffset()

            this.calcPos()

            this.classAdd('sk_ui_contextMenu_activated')
            
            this.style.left = this.__adjustedPosition.x + 'px'
            this.style.top = this.__adjustedPosition.y + 'px'
            
            
            

            if (!opt.instant){
                this.style.opacity = 0
                setTimeout(()=>{ this.style.opacity = 1 }, 10)
                await this.transition('fade in')
            } else {
                this.style.display = 'unset'
                this.animate = false
                this.style.opacity = 1
                //this.animate = true
            }

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
                    _c.cmParent = this.cmParent
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


        this.attributes.add({friendlyName: 'Disabled', name: 'disabled', type: 'bool', onSet: val => {
            if (val){
                this.pointerEvents = 'none'
                this.opacity = 0.5
            } else {
                this.pointerEvents = ''
                this.opacity = 1
            }
        }})

        this.attributes.add({friendlyName: 'Passive', name: 'passive', type: 'bool', onSet: val => {
            if (val){
                this.pointerEvents = 'none'
            } else {
                this.pointerEvents = ''
            }
        }})
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
        this.opt._item = this

        if (this.opt.icon){
            if (/\p{Emoji}/u.test(this.opt.icon)){
                this.leftSide.icon = this.leftSide.iconContainer.add.label(_c => {
                    _c.text = this.opt.icon
                })
                this.hasIcon = true
            } else {
                this.leftSide.icon = this.leftSide.iconContainer.add.icon(_c => {
                    _c.icon = this.opt.icon
                    _c.size = 16
                })
                this.hasIcon = true
            }
        }

        
        if (opt.separator) this.as_separator()
        else if (opt.header) this.as_header()
        else if (opt.input) this.as_input()
        else this.as_item()

        this.disabled = opt.disabled
        this.passive = opt.passive
    }

    as_item(){
        if (this.opt.onCustomize) if (!this.opt.onCustomize(this)) return

        if (!this.opt.disabled){
            this.classAdd('sk_ui_contextMenu_Item_enabled sk_ui_contextMenu_Item_interactable')
        }

        

        this.content.add.text(_c => {
            _c.wrap = true
            _c.text = this.opt.label
        })

        if (this.opt.items){
            this.rightSide.add.icon(_c => {
                _c.icon = 'chevron right icon'
            })
        }

        

        if (this.opt.shortcut && !this.opt.items){
            this.rightSide.add.fromNew(sk_ui_contextMenu_shortcut, _c => {
                _c.setCombination(this.opt.shortcut)
                //if (this.parent.widestItem < _c.rect.width) this.parent.widestItem = _c.rect.width
            })
        }

        

        this.element.addEventListener('click', _e => {
            if (this.opt.items) return _e.stopPropagation()
            this.cmParent._onItemClicked(this.opt)
        })

        this.element.addEventListener('mouseup', _e => {
            if (this.opt.items || this.submenu) return _e.stopPropagation()
            if (!this.parent.canClose) return
            if (this.opt.onClick) this.opt.onClick(this.opt)
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
            if (this.submenu || this.submenuID) return

            var rect = this.rect

            clearTimeout(this.closeTimer)
            clearTimeout(this.showTimer)
            sk.app.add.contextMenu(async _c => {
                this.submenuID = _c.uuid
                _c.cmParent = this.cmParent
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

        if (this.cmParent.onItemCreated) this.cmParent.onItemCreated(this)
    }

    as_header(){
        this.classAdd('sk_ui_contextMenu_Item_Header')

        this.content.add.label(_c => {
            _c.text = this.opt.header
        })
    }

    as_separator(){
        this.classAdd('sk_ui_contextMenu_Item_Separator')
        if (this.opt.passive) this.classAdd('sk_ui_contextMenu_Item_Separator_passive')
    }

    as_input(){
        this.rightSide.marginLeft = 0.01
        this.content.styling += ' fullwidth'
        var input = this.content.add.input(_c => {
            _c.styling += ' fullwidth'
            _c.type = this.opt.input
            _c.value = this.opt.value || ''
            _c.onChanged = val => {
                if (this.opt.onChanged) this.opt.onChanged({sender: this, val: val})
            }
        })

        if (this.opt.input === 'color'){
            var style = input.input.style
            style.borderStyle = 'none'
            style.padding = '0px'
            style.borderWidth = '0px'
            style.backgroundColor = 'transparent'
            style.borderColor = 'transparent'
            style.color = 'white'
        }
    }
}
