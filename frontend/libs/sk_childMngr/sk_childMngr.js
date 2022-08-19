class SK_ChildMngr {
    constructor(opt){
        this.opt = opt

        this.children = []

        this.configParent()
    }

    recalculateIndices(){
        for (var i = 0; i < this.children.length; i++) this.children[i].child_idx = i
    }

    add(obj){
        this.children.push(obj)
        obj.parent = this.opt.parent
        this.recalculateIndices()
    }

    delete(idx){
        this.children.splice(idx, 1)
        this.recalculateIndices()
    }

    clear(){
        for (var i = this.children.length - 1; i > -1; i--) this.children[i].remove()
    }

    configParent(){
        this.opt.parent.add = {
            fromNew: (sk_ui_class, cb) => {
                var obj = new sk_ui_class({parent: this.opt.parent})
                this.add(obj)
                if (cb) cb(obj)
                return obj
            }
        }
        var addComponent = component => {
            this.opt.parent.add[component] = cb => {
                var _component = undefined
        
                for (var _which in sk.ui.components.lists){
                    var _cList = sk.ui.components.lists[_which]
                    if (_cList[component]){
                        _component = _cList[component]
                        break
                    }
                }
        
                if (!_component){
                    console.error('No component found called: ' + component)
                    return
                }
        
                var _c = new _component({parent: this.opt.parent})
                
                this.add(_c)
        
                if (cb) cb(_c)
        
                return _c
            }
        }
        
        for (var _which in sk.ui.components.lists){
            var _cList = sk.ui.components.lists[_which]
            for (var _component in _cList) addComponent(_component)
        }
    }
}