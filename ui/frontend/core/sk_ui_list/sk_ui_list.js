
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
            add: opt => {
                var item = this.container.add.fromNew(sk_ui_listItem, _c => {
                    _c.info = opt
                    _c.text = opt.label

                    if (opt.hint) _c.hint({text: opt.hint, position: 'right center'})

                    _c.element.addEventListener('click', ()=>{
                        if (!this.highlightOnSelect){
                            if (this.onItemSelected) this.onItemSelected(_c)
                            return
                        }
                        
                        this.deselectAll()

                        if (this.onBeforeItemSelected) this.onBeforeItemSelected(_c) 

                        _c.toggled = true

                        if (this.onItemSelected) this.onItemSelected(_c)
                    })

                    _c.onIconChanged = ()=>{
                        this.updateIconWidth()
                    }
                })

                this.list.push(item)
                if (this.onNewItem) this.onNewItem(item)
                return item
            }
        }


        /************/

        this.attributes.add({friendlyName: 'Reverse', name: 'reverse', type: 'bool', onSet: val => {
            if (val) this.container.styling = 'btt'
            else this.container.styling = 'ttb'
        }})

        this.attributes.add({friendlyName: 'Highlight On Select', name: 'highlightOnSelect', type: 'bool'})
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
                
                item._icon.show({animation: 'width'})
            }
        }        
    }

    deselectAll(){
        for (var i in this.list) this.list[i].toggled = false
    }

    clear(){
        this.children.forEach(child => { child.remove() })
    }

    /*onIconSet(){
        var iconSet = false
        for (var i in this.list){
            var item = this.list[i]
            if (item.icon) iconSet = true
        }

        if (iconSet){

        }
        
    }*/
}