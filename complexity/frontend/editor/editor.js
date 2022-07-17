
class ss_ui_complexity_editor {
    constructor(opt){
        opt.app.body.classAdd('ss_ui_complexity_appBody')

        opt.app.disableComplexity()
        opt.app.body.disableComplexity()
        

        opt.app.add.component(_c => {
            _c.classAdd('ss_ui_complexity_editor vertical_margin normal')

            _c.style.overflowY = 'scroll'
            _c.styling = 'ttb'

            _c.add.component(_c => {
                _c.add.component(_c => {
                    _c.add.dropdown(_c => {
                        _c.style.width = '100%'
                        
                        _c.text = 'View'
            
                        var items = []
                        
                        for (var _v in ss.viewList){
                            var view = ss.viewList[_v]
                            items.push({label: _v, info: {name: _v, route: (view.route === '/' ? ''  : view.route)}})
                        }
            
                        _c.items = items
            
                        _c.onItemClicked = item => {
                            _c.text = item.info.name
                            window.location = '/' + item.info.route
                        }
                    })
                })
            
                _c.add.spacer(_c => {
                    _c.styling = 'fill'
                    
                    
                })
            
                _c.add.component(_c => {
                    this.showEditsToggleBtn = _c.add.button(_c => {
                        _c.type = 'icon'
                        _c.icon = 'edit'
                        _c.toggle = true
                        _c.hint('Show edits  (CTRL + <)', 'bottom center')

                        _c.onClick = ()=>{
                            ss.complexity.core.showEdits = _c.toggled
                        }
                    })

                    this.inflateToggleBtn = _c.add.button(_c => {
                        _c.type = 'icon'
                        _c.icon = 'expand alternate'
                        _c.toggle = true
                        _c.hint('Inflate  (<)', 'bottom center')

                        _c.onClick = ()=>{
                            ss.complexity.core.inflated = _c.toggled
                        }
                    })
                    
                    this.wireframeToggleBtn = _c.add.button(_c => {
                        _c.type = 'icon'
                        _c.icon = 'lightbulb outline'
                        _c.toggle = true
                        _c.hint('Wireframe (SHIFT + <)', 'bottom center')

                        _c.onClick = ()=>{
                            ss.complexity.core.wireframe = _c.toggled
                        }
                    })


                    this.codeEditorToggleBtn = _c.add.button(_c => {
                        _c.type = 'icon'
                        _c.icon = 'code'
                        _c.toggle = true
                        _c.toggled = true
                        _c.hint('Code', 'bottom center')

                        _c.onClick = ()=>{
                            ss.complexity.core.codeEditorVisible = _c.toggled
                        }
                        
                    })

                    
                    
                })
            })
            
            this.objectTree = _c.add.fromNew(ss_ui_complexity_objectTree)

            this.stylingEditor = _c.add.fromNew(ss_ui_complexity_stylingEditor)

            this.attributeEditor = _c.add.fromNew(ss_ui_complexity_attributeEditor,
                _c => {
                    _c.onShowIcons = object => {
                        this.iconList.style.display = ''
                        this.iconList.selectedObject = object
                    }
                }
            )

            this.iconList = _c.add.fromNew(ss_ui_complexity_iconList, _c => { _c.style.display = 'none' })

            _c.disableComplexity(true, true)

        })
    }

    updateFromSelection(selectedObjects){
        this.iconList.style.display = 'none'

        this.selectedObjects = selectedObjects       

        this.stylingEditor.updateFromSelection(selectedObjects)
        this.attributeEditor.updateFromSelection(selectedObjects)
    }

    
}

