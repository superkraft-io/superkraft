
class sk_ui_list extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'ttb'
        this.vertical = 'none'

        this.header = this.add.component(_c => {
            _c.styling = 'ttb'
            _c.classAdd('sk_ui_list_header')
        })

        this.container = this.add.component(_c => {
            _c.classAdd('sk_ui_list_container')
            _c.styling = 'ttb fullheight fill'
        })

        this.footer = this.add.component(_c => {
            _c.styling = 'ttb'
            _c.classAdd('sk_ui_list_footer')
        })
        
        
        this.classAdd('sk_ui_list_no_icons')

        this.list = []

        this.items = {
            add: (opt, itemClass)=>{
                var item = this.container.add.fromNew(
                    (!itemClass ? sk_ui_listItem : itemClass), 
                    _c => {
                        _c.info = opt
                        _c.text = opt.label

                        if (opt.hint) _c.hint({text: opt.hint, position: 'right center'})

                        _c.element.addEventListener('click', ()=>{
                            this.selectItem({item: _c})
                        })

                        _c.onIconChanged = ()=>{
                            this.updateIconWidth()
                        }

                        
                    }
                )

                this.list.push(item)
                item.idx = this.list.length - 1

                if (this.onNewItem) this.onNewItem(item)

                if (!itemClass){
                    if (opt.icon) item.icon = opt.icon
                } else {
                    if (item.icon) item.icon = opt.icon
                }

                return item
            }
        }


        /************/

        this.attributes.add({friendlyName: 'Reverse', name: 'reverse', type: 'bool', onSet: val => {
            if (val) this.container.styling = 'btt'
            else this.container.styling = 'ttb'
        }})

        this.attributes.add({friendlyName: 'Highlight On Select', name: 'highlightOnSelect', type: 'bool'})



        this.attributes.add({friendlyName: 'Value', name: 'value', type: 'text', onSet: val => {
            this.selectItem({idx: val})
        }})
    }

    updateIconWidth(){
        var anyIconsSet = false
        for (var i in this.list){
            var item = this.list[i]
            if (item.icon !== undefined || item.icon !== '') anyIconsSet = true
        }

        if (anyIconsSet){
            this.classRemove('sk_ui_list_no_icons')
            for (var i in this.list){
                var item = this.list[i]

                if (item.iconVisible) continue
                
                item._icon.show({animation: 'width'})
                item.iconVisible = true
            }
        }        
    }

    deselectAll(){
        for (var i in this.list) this.list[i].toggled = false
    }

    clear(){
        this.chil
        for (var i = this.list.length - 1; i > -1; i--){
            this.list[i].remove()
            this.list.splice(i, 1)
        }
    }

    findItemByInfo(key, value){
        for (var i in this.list){
            var item = this.list[i]
            if (item.info[key] === value) return item
        }
    }

    async selectItem(opt){
        var item = opt.item
        if (opt.key && opt.value) item = this.findItemByInfo(opt.key, opt.value)
        if (opt.idx !== undefined) item = this.list[opt.idx]

        if (!item) throw 'Could not find item'

        if (!this.highlightOnSelect){
            if (this.onItemSelected) this.onItemSelected(item)

           
            return
        }
        
        this.deselectAll()

        if (this.onBeforeItemSelected) this.onBeforeItemSelected(item) 

        item.toggled = true

        if (this.onItemSelected) this.onItemSelected(item)

        if (this.__dawPluginParamID){
            var paramIdx = item.idx
            await this.__dawPluginWriteParamValue(paramIdx)
        }
    }

}