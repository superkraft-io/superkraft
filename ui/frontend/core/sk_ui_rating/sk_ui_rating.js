class sk_ui_rating extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.vertical = false


        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'text', default: 'star', onSet: val => {
            
        }})

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', default: 14, onSet: val => {
            
        }})

        this.attributes.add({friendlyName: 'Color', name: 'color', type: 'text', default: '#ffee00', onSet: val => {
            
        }})

        
        this.attributes.add({friendlyName: 'Count', name: 'count', type: 'number', onSet: val => {
            this.children.clear()
            for (var i = 0; i < val; i++) this.add.fromClass(sk_ui_rating_icon, _c => {
                _c.size = this.size
                _c.icon = this.icon
                _c.color = this.color
                _c.marginRight = Math.round(this.size * 0.4)
                _c.index = i

                _c.onEnter = _i => {
                    this.highlightValue(_i.index + 1)
                }

                _c.onLeave = _i => {
                    this.highlightValue(false)
                }

                _c.onClick = _i => {
                    this.value = _i.index + 1
                }
            })
        }})

        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'number', default: 0,
            onSet: val => {
                for (var i = 0; i < this.children.children.length; i++){
                    var item = this.children.children[i]
                    item.active = i < val
                }
            },

            onGet: ()=>{
                var res = 0

                for (var i = 0; i < this.children.children.length; i++){
                    var item = this.children.children[i]
                    if (!item.active) break
                    res = i+1
                }

                return res
            },
        })

        this.count = 0
    }

    highlightValue(val){
        if (!val){
            for (var i = 0; i < this.children.children.length; i++){
                var item = this.children.children[i]
                if (!item.active){
                    item.activeIcon.classRemove('sk_ui_rating_icon_activeIcon_activated')
                    item.activeIcon.color = ''
                } else {
                    item.activeIcon.classAdd('sk_ui_rating_icon_activeIcon_activated')
                    item.activeIcon.color = this.color
                }
            }

            return
        }

        for (var i = 0; i < this.children.children.length; i++){
            var item = this.children.children[i]
            if (i < val){
                item.activeIcon.classAdd('sk_ui_rating_icon_activeIcon_activated')
                item.activeIcon.color = this.color
            } else {
                item.activeIcon.classRemove('sk_ui_rating_icon_activeIcon_activated')
                item.activeIcon.color = ''
            }
        }
    }
}

class sk_ui_rating_icon extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.compact = true

        this.placeholderIcon = this.add.icon(_c => {
            _c.classAdd('sk_ui_rating_icon_placeholderIcon')
            _c.icon = 'star'
        })

        this.activeIcon = this.add.icon(_c => {
            _c.classAdd('sk_ui_rating_icon_activeIcon')
            _c.icon = 'star'
        })


        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', default: 14, onSet: val => {
            this.placeholderIcon.size = val
            this.activeIcon.size = val
            this.attributes = val
            this.width = val
            this.height = val
        }})
        
        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'text', default: 'star', onSet: val => {
            this.placeholderIcon.icon = val
            this.activeIcon.icon = val
        }})

        this.attributes.add({friendlyName: 'Active', name: 'active', type: 'bool', default: false, onSet: val => {
            this.activeIcon.classRemove('sk_ui_rating_icon_activeIcon_activated')
            this.activeIcon.color = ''
            if (val){
                this.activeIcon.classAdd('sk_ui_rating_icon_activeIcon_activated')
                this.activeIcon.color = this.color
            }
        }})

        
        this.element.addEventListener('mouseenter', ()=>{
            this.onEnter(this)
        })

        this.element.addEventListener('mouseleave', ()=>{
            this.onLeave(this)
        })

        this.element.addEventListener('click', ()=>{
            this.onClick(this)
        })
    }
}

