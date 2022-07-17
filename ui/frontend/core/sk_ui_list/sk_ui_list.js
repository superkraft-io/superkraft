
class sk_ui_list extends sk_ui_component {
    constructor(parent){
        super(parent)

        this.styling = 'ttb'
        this.vertical = 'none'

        this.header = this.add.component()

        this.container = this.add.component(_c => {
            _c.classAdd('sk_ui_list_container')
            _c.vertical = 'none'
            _c.styling = 'ttb'
            
        })

        this.filler = this.add.component(_c => {
            _c.styling = 'f'
        })
        

        this.list = []

        this.items = {
            add: opt => {
                var item = new sk_ui_listItem(this.container, opt)
                item.element.addEventListener('click', ()=>{
                    if (!this.highlightOnSelect){
                        if (this.onItemSelected) this.onItemSelected(item)
                        return
                    }
                    
                    this.deselectAll()

                    if (this.onBeforeItemSelected) this.onBeforeItemSelected(item) 

                    item.toggled = true

                    if (this.onItemSelected) this.onItemSelected(item)
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

    deselectAll(){
        for (var i in this.list) this.list[i].toggled = false
    }

    clear(){
        this.children.forEach(child => { child.remove() })
    }
}