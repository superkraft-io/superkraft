class ContextMenu {
    constructor(){
        document.addEventListener('mousemove', e => {
            this.elementUnderPoint = document.elementFromPoint(e.clientX, e.clientY)
        }, {passive: true})
    }

    hide(el){
        if (!el) el = this.bucket.contextMenu

        if (el.hiding) return
        el.hiding = true
        $(el).transition(`fade ${el.direction} out`, 150)
        if (el.sender) try { el.sender.classList.remove('contextMenuSender') } catch(err) {}
        setTimeout(()=>{el.remove()}, 400)

        document.removeEventListener('click', this.onDocumentClick)
    }

    hideAll(includinSubmenus){
        document.querySelectorAll('.contextMenu').forEach(e => {
            if (!e.classList.contains('submenu')) this.hide(e)
        })

        if (includinSubmenus){
            document.querySelectorAll('.submenu').forEach(e => {
                this.hide(e)
            })
        }
    }

    show(opt){
        this.sender = opt.sender

        if (!opt.keepExistingMenusVisible) this.hideAll()

        var tree = {
            div_contextMenu: { class: 'contextMenu', styling: 'ttb',
                events: {
                    click: e => { e.stopPropagation() },
                    mouseenter: ()=>{ bucket.contextMenu.isHovering = true },
                    mouseleave: ()=>{ bucket.contextMenu.isHovering = false }
                }
            }
        }
        
        var bucket = JSOM.parse({root: document.body, tree: tree})
        this.bucket = bucket

        var hasIcons = false

        var addItem = info => {
            if (info.separator){
                JSOM.parse({root: bucket.contextMenu, tree: {div_separator: { class: 'contextMenuSeparator' }}})
                return
            }

            if (info.header){
                JSOM.parse({root: bucket.contextMenu, tree: {div_header: { class: 'contextMenuheader', text: info.header }}})
                return
            }

            if (info.icon) hasIcons = true

            var subMenu = undefined


            var itemContent = { class: `contextMenuItem ${(!info.items ? 'contextMenuItem-interactable' : '')} ${(opt.isSubmenu ? 'submenu' : '')}`, styling: 'c' }
            if (!info.customItemContent){
                itemContent = {
                    ...itemContent,
                    ...{
                        div_icon: { styling: 'c',
                            i_icn: { class: info.icon + ' icon'}
                        },

                        div_label: { text: info.label },

                        div_space: { styling: 'f' },

                        div_rightSide: { styling: 'c',
                            i_arrow: { class: (info.items ? 'angle right icon' : '')}
                        },

                        events: {
                            click: e => {
                                e.stopPropagation()
                                if (info.items && !info.forceAccepOnClick) return

                                this.hideAll(true)

                                if (info.onClick) info.onClick(info, itemBucket.item)

                                if (opt.onItemClicked) opt.onItemClicked(info)

                                if (info.parent && info.parent.onAnyItemClicked){
                                    info.parent.onAnyItemClicked(info)
                                }
                            },
                            
                            mouseenter: ()=>{
                                itemBucket.item.classList.remove('contextMenuItem-submenuExpanded')

                                if (!info.items) return
                                if (subMenu) return
                                
                                var parentRect = itemBucket.item.getBoundingClientRect()
                                var parentPos = {x: parentRect.left + document.body.scrollLeft, y: parentRect.top + document.body.scrollTop}
                                
                                var pos = {x: parentPos.x + parentRect.width - 2, y: parentPos.y - parentRect.height - 2 }
                                
                                bucket.contextMenu.submenuTimer = setTimeout(()=>{
                                    if (bucket.contextMenu.hiding) return
                                    subMenu = this.show({
                                        direction: 'right',
                                        pos: {x: pos.x, y: pos.y},
                                        keepExistingMenusVisible: true,
                                        items: info.items.map(item => {
                                            return {...item, ...{
                                                parent: info,
                                                onAnyItemClicked: (info ? info.onAnyItemClicked : undefined)
                                            }}
                                        }),
                                        parent: this
                                    })
                                }, 400)

                                if (info.onEnter) info.onEnter(info, itemBucket.item)
                            },

                            mouseleave: ()=>{
                                clearTimeout(bucket.contextMenu.submenuTimer)
                                setTimeout(()=>{
                                    if (!subMenu) return
                                    if (subMenu.isHovering){
                                        itemBucket.item.classList.add('contextMenuItem-submenuExpanded')
                                        return
                                    }

                                    this.hide(subMenu)
                                    subMenu = undefined
                                }, 100)

                                if (info.onLeave) info.onLeave(info, itemBucket.item)
                            }
                        }
                    }
                }

            } else {
                itemContent = {...itemContent, ...info.customItemContent(opt, info)}
            }

            var itemBucket = JSOM.parse({root: bucket.contextMenu, tree: {
                div_item: itemContent
            }})

            if (opt.onItemCreated) opt.onItemCreated(itemBucket)

            return itemBucket
        }

        var items = []

        for (var i = 0; i < opt.items.length; i++){
            items.push(addItem(opt.items[i]))
        }

        if (!hasIcons){
            for (var i = 0; i < items.length; i++){
                
                try {
                    items[i].label.style.marginLeft = '8px'
                    items[i].icon.remove()
                } catch(err) {}
            }
        }

        if (opt.offset){
            if (opt.offset.x) opt.pos.x += opt.offset.x
            if (opt.offset.y) opt.pos.y += opt.offset.y
        }

        var docRect = document.body.getBoundingClientRect()
        var menuRect = bucket.contextMenu.getBoundingClientRect()

        var compensatedPosByOrigin = {x: opt.pos.x, y: opt.pos.y}
        if (opt.origin && opt.origin.indexOf('bottom') > -1){
            opt.pos.y -= 4
            compensatedPosByOrigin.y = opt.pos.y - menuRect.height
            
        } else {
            compensatedPosByOrigin.y += 18
        }

        if (compensatedPosByOrigin.x + menuRect.width  > docRect.width) compensatedPosByOrigin.x = docRect.width - menuRect.width - 2
        if (compensatedPosByOrigin.y + menuRect.height > docRect.height) compensatedPosByOrigin.y = docRect.height - menuRect.height - 2

        

        
        bucket.contextMenu.style.left = compensatedPosByOrigin.x + 'px'
        bucket.contextMenu.style.top  = compensatedPosByOrigin.y + 'px'

        if (menuRect.height > docRect.height){
            bucket.contextMenu.style.top = '0px'
            bucket.contextMenu.style.bottom = '0px'
            bucket.contextMenu.style.overflowY = 'scroll'
        }

        bucket.contextMenu.style.opacity = 1


        bucket.contextMenu.direction = opt.direction || 'down'
        $(bucket.contextMenu).transition(`fade ${bucket.contextMenu.direction} in`, 150)

        bucket.contextMenu.sender = opt.sender
        if (opt.sender) opt.sender.classList.add('contextMenuSender')


        bucket.contextMenu.addEventListener('contextmenu', _e => {
            _e.preventDefault()
            _e.stopPropagation();
            return false
        })
        

        if (!this.elementUnderPoint._cm){
            this.elementUnderPoint.addEventListener('contextmenu', _e => {
                _e.preventDefault()
                _e.stopPropagation();
                return false
            })
            this.elementUnderPoint._cm = true
        }

        var ignoredFirstDocumentClick = false
        this.onDocumentClick = event => {
            if (opt.toggle && !ignoredFirstDocumentClick){
                ignoredFirstDocumentClick = true
                return
            }

            this.hideAll()
        }
        document.addEventListener('click', this.onDocumentClick, false)

        return this
    }
}
