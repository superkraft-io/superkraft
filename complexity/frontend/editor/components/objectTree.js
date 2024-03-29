class sk_ui_complexity_objectTree extends sk_ui_groupCollapsable {
    constructor(opt){
        super(opt)

        

        this.header = 'Object Tree'
        
        this.style.maxHeight = '500px'

        this.container.style.overflowY = 'scroll'

        this.collapsable = true

        setTimeout(()=>{
            this.update()
        }, 5000)
    }

    applyStyle(group, serializedObject){
        group.collapsable = true
        group.collapseOnIcon = true

        group.top.classAdd('sk_ui_complexity_objectTree_item')
        
        
        if (serializedObject.pseudoClassName) group._header.color = '#ffcc00'

        group._header.add.spacer()
        group._header.add.label(_c => {
            _c.text = serializedObject.class.split('sk_ui_')[1]
            _c.color = '#5f5f5f'
            _c.weight = 600
            _c.style.marginRight = '4px'
        })
    

        group.collapseButton._icon.style.transform = 'rotate(180deg)'

        /*function calcHeight(group){
            var total = 0
            group.children.forEach(child => {
                if (child.collapsed) return
                var fullHeight = 32 * child.children.length
                total += fullHeight
            })
            return total
        }*/

        group.onCollapsed = collapsed => {
            //if (collapsed === 'recalc') return group.container.style.height = calcHeight(group) + 'px'
            if (collapsed){
                group.collapseButton._icon.style.transform = 'rotate(90deg)'
                //group.container.style.height = '0px'
            } else {
                group.collapseButton._icon.style.transform = 'rotate(180deg)'
                //group.container.style.height = calcHeight(group) + 'px'
                //if (group.parent.onCollapsed) group.parent.onCollapsed('recalc')
            }
        }

        group.collapseButton.moveBefore(group._header)

        if (serializedObject.children.length === 0 || serializedObject.multiComponent){
            group.collapsable = false
            group.collapsed = true
        }
    }

    update(){
        $(this.container.element).empty()

        var view = sk.app.body.view
        var serialization = view.serialize(false, true)

        var addAndTraverse = (parentGroup, component)=>{
            var group = parentGroup.add.groupCollapsable(_c => {
                _c.styling += ' fullwidth'
                _c.classAdd('sk_ui_complexity_objectTree_item_group')
                component.component.objectListItem = _c


                _c.header = component.id.replace('sk_ui_', '')
                _c.targetObject = component

                _c.top.element.addEventListener('mouseup', _e => {
                    sk.complexity.core.selectionManager.deselectAll()
                    if (!_e.shiftKey) sk.complexity.core.selectionManager.clear()
                    sk.complexity.core.selectionManager.add(component.component)
                })


                _c.element.addEventListener('mouseenter', _e => {
                    component.component.classAdd('sk_ui_complexity_object_highlighted')
                    
                    var path = _e.target.sk_ui_obj.getPath()
                    for (var i = 1; i < path.length; i++){
                        try {
                        
                            var el = path[i]
                            var sk_ui_obj = el.sk_ui_obj
                            var targetObj = sk_ui_obj.targetObject
                            if (targetObj){
                                var x = 0
                            }
                            targetObj.classRemove('sk_ui_complexity_object_highlighted')
                        } catch(err) {
                            var x = 0
                        }
                    }
                    
                })
                _c.element.addEventListener('mouseleave', _e => {
                    component.component.classRemove('sk_ui_complexity_object_highlighted')
                })

                this.applyStyle(_c, component)
            })

            component.children.forEach(child => { addAndTraverse(group.container, child) })
            
            

            return group
        }
        
        this.viewGroup = addAndTraverse(this.container, serialization)

        this.disableComplexity(true, true)
        

        sk.complexity.codeEditor.bake()
    }
}