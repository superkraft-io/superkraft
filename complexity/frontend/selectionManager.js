
class ss_ui_complexity_selectionManager {
    constructor(){
        this.list = []
    }

    clear(){
        this.deselectAll()
        this.list = []
    }

    deselectAll(){
        document.querySelectorAll('.sk_ui_complexity_object_selected').forEach(e =>{
            e.classList.remove('ss_ui_complexity_object_selected')
            try { e.sk_ui_obj.objectListItem.classRemove('ss_ui_complexity_objectTree_item_selected') } catch(err) {}
        })
    }

    add(component){
        var add = true
        for (var i in this.list){
            if (this.list[i].uuid === component.uuid){
                this.list[i].classRemove('ss_ui_complexity_object_selected')
                this.list[i].objectListItem.classRemove('ss_ui_complexity_objectTree_item_selected')
                this.list.splice(i,1)
                add = false
                break
            } else {
                
            }
        }

        if (add) this.list.push(component)
        
        this.list.forEach(_c =>{
            _c.classAdd('ss_ui_complexity_object_selected')
            try { _c.objectListItem.classAdd('ss_ui_complexity_objectTree_item_selected') } catch(err) {}
        })
        

        this.update()

        
    }

    deleteSelected(){
        this.list.forEach(_c => {
            _c.remove()
            _c.objectListItem.remove()
        })

        this.clear()
    }

    update(codeOnly){
        if (!codeOnly) sk.complexity.editor.updateFromSelection(this.list)

        sk.complexity.codeEditor.multiObjectWarning.hide()
        if (this.list.length === 1) sk.complexity.codeEditor.from(this.list[0])
        else sk.complexity.codeEditor.multiObjectWarning.show()
    }

    classifySelected(){
        this.list.forEach(_c => {
            if (!_c.pseudoClassName) _c.pseudoClassName = _c.uuid
            else _c.pseudoClassName = undefined
        })
    }


    copySelected(){
        if (this.list.length === 0) return

        var serialization = []

        this.list.forEach(_c => {
            serialization.push(_c.serialize(false, false, true))
        })

        navigator.clipboard.writeText(JSON.stringify(serialization)).then(function() {
            console.log('Selected objects copied')
            $('body')
            .toast({
                position: 'top center',
                class: 'success',
                message: `Objects copied to clipboard`
            })
        }, function() {
            console.error('Failed to copy selected objects')
            $('body')
            .toast({
                position: 'top center',
                class: 'error',
                message: `Failed to copy selected objects`
            })
        })
    }

    pasteIntoSelected(){
        if (this.list.length === 0){
            $('body')
            .toast({
                position: 'top center',
                class: 'error',
                message: `Select an object to paste in to`
            })
            return
        }

        var serialization = []

        navigator.clipboard.readText().then(clipText => {
            var serialization = []
            
            try { serialization = JSON.parse(clipText) } catch(err) { return }
            
            if (serialization.length === 0) return
            
            var target = this.list[this.list.length - 1]

            if (!serialization[0].class) return

            this.clear()
            
            this.duplicateFromList(target, serialization)
        })
    }

    duplicateFromList(target, list){

        var traverseAdd = (parent, serialization) => {
            return parent.add[serialization.clask.replace('ss_ui_', '')](_c => {
                for(var attrName in serialization.attributes){
                    if (attrName === 'pseudoClassName' || attrName === 'uuid') continue
                    
                    var attribute = serialization.attributes[attrName]
                    
                    _c[attrName] = attribute.value
                }

                serialization.children.forEach(_cS => {
                    traverseAdd(_c, _cS)
                })
            })
        }

        list.forEach(_sC => {
            var newObject = traverseAdd(target, _sC)
            this.add(newObject)
        })

        sk.complexity.editor.objectTree.update()
    }

    duplicateSelected(){
        if (this.list.length === 0) return

        var toDuplicate = this.list

        this.clear()

        toDuplicate.forEach(_c => {
            this.duplicateFromList(_c.parent, [_c.serialize(false, false, true)])
        })
    }

    groupSelected(){
        if (this.list.length === 0) return

        var toGroup = this.list

        this.clear()

        var collections = {}
        toGroup.forEach(_c => {
            var uuid = _c.parent.uuid
            if (!collections[uuid]) collections[uuid] = []
            collections[uuid].push(_c)
        })

        var toSelect = []

        for(var collectionParentID in collections){
            var collection = collections[collectionParentID]

            var target = collection[0].parent.add.component()
            toSelect.push(target)

            collection.forEach(_c => {
                this.duplicateFromList(target, [_c.serialize(false, false, true)])

                _c.remove()
            })
        }

        this.clear()
        
        toSelect.forEach(_c => this.add(_c))
    }
}

