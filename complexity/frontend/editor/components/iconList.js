class ss_ui_complexity_iconList extends ss_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)
            this.classAdd('ss_ui_complexity_iconList')
            this.styling = 'ttb flex'

            this.style.height = '100%'

            var categories = []

            this.container = this.add.group(_c => {
                _c.style.height = '100%'
                _c.header = 'Icons'
                _c.add.input(_c => {
                    _c.style.width = '100%'
                    _c.style.marginBottom = '32px'
                    _c.placeholder = 'Search icons...'
                    _c.input.onkeyup = _e => {
                        categories.forEach(cat => {
                            cat.filterFor(_c.value)
                        })
                    }
                })
            })

            for (var i in sk.complexity.core.lists.icons){
                var category = sk.complexity.core.lists.icons[i]

                category = this.container.add.component(_c => {
                    _c.styling = 'ttb'

                    _c.style.marginBottom = '32px'

                    _c.add.label(_c => {
                        _c.style.marginLeft = '8px'
                        _c.weight = 600
                        _c.size = 12

                        var strSplit = category.label.split(' ')
                        for (var i in strSplit) strSplit[i] = strSplit[i].substr(0,1).toUpperCase() + strSplit[i].substr(1, strSplit[i].length)
                        _c.text = strSplit.join(' ')
                    })

                    _c.icons = _c.add.component(_c => {
                        _c.styling = 'wrap'
                        
                        for (var u in category.items){
                            var iconItem = category.items[u]
                            _c.add.button(_c => {
                                
                                _c.icon = iconItem.label
                                _c._icon.size = 25

                                _c.text = iconItem.label
                                _c.label.style.display = 'none'

                                _c.hint(iconItem.label, 'bottom left')

                                _c.onClick = ()=>{
                                    this.selectedObject.classAdd('ss_ui_complexity_object_edited')
                                    this.selectedObject.icon = _c.icon
                                }
                            })
                        }
                    })


                    _c.filterFor = str => {
                        _c.style.display = 'none'
                        for (var i = 0; i < _c.icons.children.length; i++){
                            var child = _c.icons.children[i]
                            if (!str || str === ''){
                                child.style.display = ''
                                _c.style.display = ''
                                return
                            }

                            try {
                                child.style.display = 'none'
                                if (child.text.indexOf(str) > -1){
                                    child.style.display = ''
                                    _c.style.display = ''
                                }
                            } catch(err) {
                                console.log(child)
                            }
                        }
                    }
                })

                categories.push(category)
            }

    }
}