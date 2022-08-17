class ss_ui_complexity_attributeEditor extends ss_ui_group {
    constructor(opt){
        super(opt)
        this.header = 'Attributes'
        this.container.style.height = 'fit-content'
        this.collapsable = true
    }

    

    updateFromSelection(objects){
        this.objects = objects

        this.header = 'Attributes'
        if (objects.length > 1) this.header += ` (${objects.length} objects)` 

        try { this._container.remove() } catch(err) {}

        var addedCategories = {}

        var addedAttributes = {}


        this._container = this.container.add.component(_c => {
            _c.styling = 'ttb fullwidth'
        })

        objects.forEach(object => {
            object.attributes.categories.forEach(category => {
                var existingCategory = addedCategories[category.name]
                if (!existingCategory){
                    addedCategories[category.name] = this._container.add.groupCollapsable(group => {
                        if (category.horizontal){
                            group.container.styling = group.container.styling.replace('ttb', ' sb')
                        }

                        group.collapsable = true
                        group.header = category.name

                        group.container.padding = 4
                    })
                    existingCategory = addedCategories[category.name]
                }

                category.attributes.forEach(attribute => {
                    if (attribute.notEditable) return

                    if (addedAttributes[attribute.name]) return
                    else addedAttributes[attribute.name] = true

                    if (attribute.type === 'icon'){
                        this.onShowIcons(object)
                    } else {
                        
                        var tableAttributeRow = new ss_ui_attributeItem(existingCategory, category.horizontal, category.attributes.length, this.objects)//, table)
                        tableAttributeRow.from(object, attribute)
                    }
                })
            })
        })
        

        this.disableComplexity(true, true)
    }
}

class ss_ui_attributeItem {
    constructor(parent, horizontal, count, objects, table){
        this.objects = objects

        parent.container.add.component(_c => {
            _c.styling += ' center fullwidth'
            _c.padding = 4

            var maxWidth = '50%'
            var labelStyling = 'right middle'
            var labelPadding = '12px'

            if (horizontal){
                _c.styling = _c.styling.replace('fullwidth', 'ttb')
                _c.style.width = (100 / count) + '%'
                maxWidth =  '100%'
                labelStyling = 'center middle'
                labelPadding = '0px'
            }
            

            this.left = _c.add.component(_c => {
                _c.style.maxWidth = maxWidth
                _c.style.width = maxWidth
                
                _c.styling = labelStyling
                _c.style.paddingRight = labelPadding

                this.label = _c.add.label(_c => {
                    _c.size = 12
                    _c.color = '#d6d6d6;'
                })
            })

            this.right = _c.add.component(_c => {
                _c.styling = 'center ttb'
                _c.style.maxWidth = maxWidth
                _c.style.width = maxWidth
            })
        })
        
    }

    apply(val){
        this.objects.forEach(object => {
            object.classAdd('ss_ui_complexity_object_edited')
            if (sk.complexity.core.showEdits) object.classAdd('ss_ui_complexity_object_edited_show')
            try { object[this.attr.name] = val } catch(err) { }
        })

        sk.complexity.core.selectionManager.update(true)
    }

    from(obj, attr){
        this.object = obj
        this.attr = attr

        this.label.text = attr.friendlyName

        try {
            this.currValue = this.object[this.attr.name]
            if (attr.css) this.currValue = this.currValue.replace(attr.css.split('?')[1], '')
            this[attr.type + 'Type']()
        } catch(err) {

        }
    }

    textType(){
        this.right.add.input(_c => {
            _c.style.width = '100%'
            if (this.currValue) _c.value = this.currValue

            _c.onChanged = val =>{
                this.apply(val)
            }
        })
    }

    numberType(){
        
        var input = this.right.add.input(_c => {
            _c.style.width = '100%'
            _c.type = 'number'

            _c.value = this.currValue

            _c.onChanged = val =>{
                this.apply(val)
                slider.value = val
            }
        })

        var slider = this.right.add.slider(_c => {
            _c.value = this.currValue
            _c.style.margin = '0px 12px'
            _c.style.width = 'unset'

            var units = this.attr.units
            if (units){
                if (units.step) _c.step = this.attr.units.step
                if (units.min) _c.min = units.min
                if (units.max) _c.max = units.max
            }

            _c.onChanged = val => {
                this.apply(val)
                input.value = val
            }
        })
    }

    colorType(){
        this.right.add.colorPicker(_c => {
            _c.style.width = '100%'
            _c.style.height = '32px'
            
            _c.onChanged = color =>{ this.apply(color) }

            if (this.currValue) _c.color = sk.utils.rgb2hex(this.currValue) || this.currValue
        })
    }

    listType(){
        this.right.add.dropdown(_c => {
            _c.style.width = '100%'


            var itemName = undefined
            this.attr.items.forEach(item => {
                if (item.value === this.currValue) itemName = item.name
            })

            _c.text = itemName

            var items = []
            
            this.attr.items.forEach(item => {
                items.push({label: item.name || item.value, info: item})
            })

            _c.items = items

            _c.onItemClicked = item => {
                _c.text = item.info.name
                this.apply(item.info.value)
            }
        })
    }

    boolType(){
        this.right.add.switch(_c => {
            _c.toggled = this.currValue
            _c.onChanged = toggled => this.apply(toggled)
        })
    }
}