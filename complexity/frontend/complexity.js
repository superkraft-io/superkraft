
class ss_ui_complexity {
    constructor(){


        this.selectedObjects = []
        this.allowDelete = true

        this.selectionManager = new ss_ui_complexity_selectionManager()


        /***********/

        this.lists = {
            icons: new ss_ui_complexity_icons().icons
        }
        for (var _c in this.lists.icons){
            var _cat = this.lists.icons[_c]
            for (var _i in _cat.items){
                var item = _cat.items[_i]
                item.icon = item.label    
                item.value = item.label        
            }
        }

        document.addEventListener('mousemove', _e => {
            this.mousePos = {x: _e.clientX, y: _e.clientY}
        })

        document.addEventListener('keydown', _e => {
            
            
        })

        var doubleKey = false
        

        document.addEventListener('keyup', _e => {
            var ignoreFor = ['INPUT', 'TEXTAREA']
            if (ignoreFor.includes(_e.target.tagName )){
                _e.stopPropagation()
                return
            }

            _e.preventDefault()

            
            
            /**************/
            
            setTimeout(()=>{ doubleKey = false }, 300)
            /**************/

            if (_e.code === 'IntlBackslash'){
                if (_e.ctrlKey) this.showEdits = !this.showEdits
                else if (_e.shiftKey) this.wireframe = !this.wireframe
                else this.inflated = !this.inflated
            }

            else if (_e.keyCode === 46){
                this.selectionManager.deleteSelected()
            }
            else if (_e.keyCode === 27){
                this.selectionManager.deselectAll()
                this.selectionManager.clear()
            }

            else if (_e.keyCode === 226){
                if (_e.shiftKey) this.wireframe = false
            }

            if (_e.keyCode === 67){
                if (_e.ctrlKey) sk.complexity.core.selectionManager.copySelected()
                else sk.complexity.core.selectionManager.classifySelected()
            }
            
            if (_e.keyCode === 86){
                if (_e.ctrlKey) {
                    window.focus()
                    sk.complexity.core.selectionManager.pasteIntoSelected()
                }
            }

            if (_e.keyCode === 88){
                if (_e.ctrlKey){
                    sk.complexity.core.selectionManager.copySelected()
                    sk.complexity.core.selectionManager.deleteSelected()
                } else {
                    sk.complexity.core.selectionManager.deleteSelected()
                }
            }

            if (_e.keyCode === 71){
                if (_e.shiftKey){
                    _e.preventDefault()
                    sk.complexity.core.selectionManager.groupSelected()
                }
            }

            if (_e.keyCode === 68){
                if (_e.shiftKey){
                    sk.complexity.core.selectionManager.duplicateSelected()
                }
            }

            if (_e.keyCode === 65){
                if (_e.shiftKey){
                    sk.complexity.core.showUIComponentMenu(this.mousePos)
                }
            }

            if (_e.keyCode === 66){
                if (_e.ctrlKey){
                    if (_e.shiftKey) sk.complexity.codeEditor.bakeOutputBtn.toggled = !sk.complexity.codeEditor.bakeOutputBtn.toggled
                    else sk.complexity.codeEditor.bake()
                }
            }
            if (doubleKey === true){
                if (_e.code == 'ShiftLeft'){
                    console.log('Padding joystick ON!')
                }

                if (_e.code == 'ControlLeft'){
                    console.log('Margin joystick ON!')
                }
            }



            doubleKey = true
        })



        ss_ui_component.prototype.__ss_ui_continue_constructor__ = function(parent){
            this.events = {}

            this.classAdd('ss_ui_complexity_object')

            this.events.mouseenter = _e => {
                //_e.currentTarget.style.border = 'dashed 1px white'
                _e.currentTarget.sk_ui_obj.classAdd('ss_ui_complexity_object_highlighted')
                try { _e.currentTarget.sk_ui_obj.objectListItem.top.classAdd('ss_ui_complexity_objectTree_item_highlighted') } catch(err) {}

                
                for (var i = 1; i < _e.path.length; i++){
                    try { _e.path[i].sk_ui_obj.classRemove('ss_ui_complexity_object_highlighted') } catch(err) {}
                    try { _e.path[i].sk_ui_obj.objectListItem.top.classRemove('ss_ui_complexity_objectTree_item_highlighted') } catch(err) {}
                }

               
            }
            this.element.addEventListener('mouseenter', this.events.mouseenter, false)



            this.events.mouseleave = _e => {
                _e.currentTarget.sk_ui_obj.classRemove('ss_ui_complexity_object_highlighted')
                

                for (var i = 0; i < _e.path.length; i++) try { _e.path[i].sk_ui_obj.objectListItem.top.classRemove('ss_ui_complexity_objectTree_item_highlighted') } catch(err) {}

                if (_e.path[3].sk_ui_obj){
                    _e.path[1].sk_ui_obj.classAdd('ss_ui_complexity_object_highlighted')
                    _e.path[1].sk_ui_obj.objectListItem.top.classAdd('ss_ui_complexity_objectTree_item_highlighted')
                }
               
            }
            this.element.addEventListener('mouseleave',this.events.mouseleave, false)



            this.events.contextmenu = _e => {
                _e.preventDefault()
                
                return false
            }
            this.element.addEventListener('contextmenu', this.events.contextmenu, false)


    
            this.events.mousedown = _e => {
                if (_e.target.classList.contains('ss_ui_complexity_object')){
                    if (_e.target !== this.element) return
                    if (_e.which === 1){
                        this.mouseDown = true
                    }
                }
            }
            this.element.addEventListener('mousedown', this.events.mousedown, true)

            this.events.mouseup = _e => {
                this.mouseDown = false
                if (_e.target.classList.contains('ss_ui_complexity_object')){
                    if (_e.target !== this.element) return
                    if (_e.which === 1){
                        sk.complexity.core.selectionManager.deselectAll()
                        if (!_e.shiftKey) sk.complexity.core.selectionManager.clear()

                        sk.complexity.core.selectionManager.add(this)
                    } else if (_e.which === 3){
                        _e.stopPropagation()
                        sk._cM.show({
                            pos: {x: _e.clientX, y: _e.clientY},
                            sender: this.element,
            
                            items: this.generateContextMenu()
                        })
            
                    }
                }
            }
            this.element.addEventListener('mouseup', this.events.mouseup, true)


            
            this.events.dblclick = _e => {
                _e.preventDefault()

                try {
                    if (this.attributes.find('text')){
                        var newVal = prompt('', this.text)
                                
                        if (newVal === null) return

                        this.text = newVal
                    }
                } catch(err) {}
            }
            this.element.addEventListener('dblclick', this.events.dblclick, false)



            this.onPseudoClassSet = isSet => {
                this.objectListItem._header.color = ''
                this.classRemove('ss_ui_complexity_object_classified')
                this.objectListItem.classRemove('ss_ui_complexity_objectTree_item_classified')
                if (isSet){
                    this.objectListItem.classAdd('ss_ui_complexity_objectTree_item_classified')
                    this.classAdd('ss_ui_complexity_object_classified')
                }
            }

            this.onUUIDSet = val => {
                try { this.objectListItem.header = val } catch(err) {}
            }
        }

        ss_ui_component.prototype.disableComplexity = function(recursive, andFuture){
            this.classRemove('ss_ui_complexity_object')
            this.element.removeEventListener('mouseenter', this.events.mouseenter, false)
            this.element.removeEventListener('mouseleave', this.events.mouseleave, false)
            this.element.removeEventListener('mousedown', this.events.mousedown, false)
            this.element.removeEventListener('mouseup', this.events.mouseup, false)
            this.element.removeEventListener('dblclick', this.events.dblclick, false)
            this.element.removeEventListener('contextmenu', this.events.contextmenu, false)

            if (recursive){
                this.children.forEach(_c => {
                    _c.disableComplexity(true)
                })
            }

            if (andFuture){
                this.children.add = function(obj){
                    this.push(obj)
                    this.recalculateIndices()
                    obj.disableComplexity(true, true)
                }
            }
        }
            
        ss_ui_component.prototype.generateContextMenu = function(){
    
            
    
    
            
    
            var onChildEnter = res => {
                $(res.ui_object.parent.element).css('border', 'dashed 1px grey')
                $(res.ui_object.element).css('border', 'dashed 1px #af10ff')
            }
    
            var onChildLeave = res => {
                $(res.ui_object.parent.element).css('border', '')
                $(res.ui_object.element).css('border', '')
            }
    
    
            
    
            
            
            var traverseChildren = component => {
                var childItems = []
                for (var i = 0; i < component.children.length; i++){
                    var child = component.children[i]
                    childItems.push({
                       
                        label: child.constructor.name,
                        items: child.generateContextMenu(),
                        ui_object: child,
                        onEnter: res =>{ onChildEnter(res) },
                        onLeave: res =>{ onChildLeave(res) },
                    })
                }
                return childItems
            }
            var childItems = (this.children.length > 0 ?
                [
                    { header: 'Children' },
                    ...traverseChildren(this)
                ]
            : [])
    
            return [
                { header: this.constructor.name },

                { header: 'Name' },
                { 
                    component: this,
                    customItemContent: (owner, item) => {
                        return {
                            input_componentName: { type: 'text', style: 'width: 100%; border-style: none; padding: 0px; border-width: 0px; background-color: transparent; border-color: transparent; color: white;',
                                value: this.element.id || this.uuid,
                                events: {
                                    input: _e => {
                                        this.uuid = _e.srcElement.value
                                    }
                                }
                            }
                        }
                    }
                },
                
                { separator: true },

                ...childItems,

                {   separator: true },

                ...[
                    { header: 'Edit' },
                    { label: 'Add', icon: 'plus', items: sk.complexity.core.generateUIComponentList(this) },
                    { label: 'Remove', icon: 'trash', sender: this, onClick: res => { sk.complexity.core.selectionManager.deleteSelected() } },
                ],
            
            ]
        }
    }

    generateUIComponentList(target){
        var components = {
            core: [{ header: 'Global' },],
            custom: [{ header: 'This view' }]
        }

        var onAddComponent = res => {
            target.add[res.componentName]()
            sk.complexity.editor.objectTree.update()
        }
        
        for (var compnent_name in sk.ui.components.core) components.core.push({ep: '', label: compnent_name, componentName: compnent_name, parent: this, onClick: res =>{ onAddComponent(res) } })
        for (var compnent_name in sk.ui.components.custom) components.custom.push({ep: '', label: compnent_name, componentName: compnent_name, parent: this, onClick: res =>{ onAddComponent(res) }})

        var componentMenu = [...components.core, ...components.custom]

        return componentMenu
    }

    showUIComponentMenu(pos){
        sk._cM.show({
            pos: pos,
            sender: window.activeElement,

            items: this.generateUIComponentList(this.selectionManager.list[0])
        })
    }

    set showEdits(val){
        this._showEdits = val
        var allObjects = document.querySelectorAll('.sk_ui_complexity_object_edited')
        allObjects.forEach(_el => {
            if (val) _el.classList.add('ss_ui_complexity_object_edited_show')
            else  _el.classList.remove('ss_ui_complexity_object_edited_show')
        })

        sk.complexity.editor.showEditsToggleBtn.toggled = val
    }
    get showEdits(){ return this._showEdits }

    set wireframe(val){
        this._wireframe = val
        var allObjects = document.querySelectorAll('.sk_ui_complexity_object')
        allObjects.forEach(_el => {
            if (val) _el.classList.add('ss_ui_complexity_object_wireframeOff')
            else  _el.classList.remove('ss_ui_complexity_object_wireframeOff')
        })

        sk.complexity.editor.wireframeToggleBtn.toggled = val

        if (val) this.inflated = false
    }
    get wireframe(){ return this._wireframe }

    set inflated(val){
        this._inflated = val
        var allObjects = document.querySelectorAll('.sk_ui_complexity_object')
        allObjects.forEach(_el => {
            if (val) _el.classList.add('ss_ui_complexity_object_inflate')
            else  _el.classList.remove('ss_ui_complexity_object_inflate')
        })

        sk.complexity.editor.inflateToggleBtn.toggled = val
    }
    get inflated(){ return this._inflated }


    

    set codeEditorVisible(val){
        this._codeEditorVisible = val

        if (val){
            sk.complexity.codeEditor.show()
            sk.app.body.style.right = ''
        } else {
            sk.complexity.codeEditor.hide()
            sk.app.body.style.right = '0px'
        }

        sk.complexity.editor.codeEditorToggleBtn.toggled = val
    }
    get codeEditorVisible(){ return this._codeEditorVisible }

}

