class sk_ui_groupCollapsable extends sk_ui_group {
    constructor(opt){
        super(opt)

        this.classAdd('sk_ui_groupCollapsable_collapsable_false')

        this.top.setup(_c => {
            _c.add.spacer()
            
            this.collapseButton = _c.add.button(_c => {
                _c.classAdd('sk_ui_groupCollapsable_collapseButton')
                _c.type = 'icon'
                _c.icon = 'angle up'
                _c.size = 16
                _c._icon.size = 16
                _c._icon.style.transform = 'rotate(-180deg)'
                _c.pointerEvents = 'none'
            })
        })


        var onCollapse = _e => {
            if (this.collapseOnIcon){
                if (_e.target.sk_ui_obj.uuid !== this.collapseButton._icon.uuid) return
            }
            this.collapsed = !this.collapsed
        }

        var onMouseEnter = _e => {
            //this._header.marginLeft = 8
        }

        var onMouseLeave = _e => {
            //this._header.marginLeft = 0
        }

        var collapseHandle = this.top

        var updateCollapseHandle = (activate, handle) => {
            collapseHandle.element.removeEventListener('click', onCollapse)
            //collapseHandle.element.removeEventListener('mouseenter', onMouseEnter)
            //collapseHandle.element.removeEventListener('mouseleave', onMouseLeave)
            if (handle) collapseHandle = handle
            if (activate){
                this.classRemove('sk_ui_groupCollapsable_collapsable_false')
                collapseHandle.element.addEventListener('click', onCollapse)
                //collapseHandle.element.addEventListener('mouseenter', onMouseEnter)
                //collapseHandle.element.addEventListener('mouseleave', onMouseLeave)
            } else {
                this.classAdd('sk_ui_groupCollapsable_collapsable_false')
            }
        }

        

        this.attributes.add({friendlyName: 'Collapsable', name: 'collapsable', type: 'bool', onSet: val => {
            if (val) this.classAdd('sk_ui_groupCollapsable_collapsable')
            else this.classRemove('sk_ui_groupCollapsable_collapsable')

            updateCollapseHandle(val)
        }})

        this.attributes.add({friendlyName: 'Collapse On Icon', name: 'collapseOnIcon', type: 'bool', onSet: val => {
            updateCollapseHandle(val, (val ? this.collapseButton : this.top))
        }})


        this.attributes.add({friendlyName: 'Collapsed', name: 'collapsed', type: 'bool', onSet: async val => {
            if (val){
                this.classAdd('sk_ui_groupCollapsable_collapsed')
                this.collapseButton._icon.style.transform = ''
                
            } else {
                this.classRemove('sk_ui_groupCollapsable_collapsed')
                this.collapseButton._icon.style.transform = 'rotate(-180deg)'
            }

            if (this.onCollapsed) this.onCollapsed(val)
        }})


        this.collapsable = true
    }

    
    set header(val){
        this._header.text = val
    }
}