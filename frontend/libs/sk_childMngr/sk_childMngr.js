class SK_ChildMngr {
    constructor(opt){
        this.opt = opt

        this.__children = []

        this.configParent()
    }

    set children(val){
        this.__children = val
    }

    get children(){
        var children = this.opt.parent.element.children

        var list = []
        for (var i = 0; i < children.length; i++){
            var element = children[i]
            var suo = element.sk_ui_obj
            list.push(suo)
        }

        this.__children = list

        return this.__children
    }

    recalculateIndices(){
        for (var i = 0; i < this.__children.length; i++) this.__children[i].child_idx = i
    }

    add(obj){
        this.__children.push(obj)
        obj.parent = this.opt.parent
        this.recalculateIndices()
    }

    delete(idx){
        this.__children.splice(idx, 1)
        this.recalculateIndices()
    }

    clear(){

        for (var i = this.__children.length - 1; i > -1; i--) this.__children[i].remove()
    }

    // `add.<name>` for every component, by full name, acronym (also lower case) or name without
    // vowels. The names are worked out once for all components (SK_ChildMngr.names), not for each
    // new one (that was most of what creating a component cost); a name's function is made the
    // first time this component's `add` is asked for it.
    configParent(){
        var target = {
            fromClass: (sk_ui_class, cb, extraOpt = {}) => {
                var obj = new sk_ui_class({parent: this.opt.parent, extraOpt: extraOpt})
                this.add(obj)
                if (cb) cb(obj)
                return obj
            }
        }

        this.opt.parent.add = new Proxy(target, {
            get: (t, prop) => {
                if (typeof prop !== 'string' || prop in t) return t[prop]
                var entry = SK_ChildMngr.names(prop)
                if (!entry) return undefined
                return t[prop] = (entry.full ? this.fullnameFunc(entry.component) : cb => this.addComponent_func(entry.component, cb))
            },
            has: (t, prop) => prop in t || (typeof prop === 'string' && !!SK_ChildMngr.names(prop))
        })
    }

    // The full-name form also explains the classic mistake of passing an object for the callback.
    fullnameFunc(component){
        return (cb, extraOpt)=>{
            try {
                return this.addComponent_func(component, cb, extraOpt)
            } catch(err) {
                if (typeof cb === 'object'){
                    var msg = '[SK UI  :  ILLEGAL] You are passing an object as a callback. You probably wrote "_c = {" instead of "_c => {". Notice the "=>" in correct latter statement.'
                    alert(msg)
                    console.error(msg)
                    console.error(err)
                } else {
                    console.error(err)
                }
            }
        }
    }

    // name -> {component, full}. Built from sk.ui.components.lists; built again when a name isn't
    // found and the lists have grown since (components loaded later, e.g. gated ones).
    static names(name){
        var table = SK_ChildMngr.__names
        if (table && name in table) return table[name]
        var signature = SK_ChildMngr.listsSignature()
        if (!table || signature !== SK_ChildMngr.__namesSignature){
            SK_ChildMngr.__names = table = SK_ChildMngr.buildNames()
            SK_ChildMngr.__namesSignature = signature
        }
        return table[name]
    }

    static listsSignature(){
        var lists = (sk.ui.components && sk.ui.components.lists) || {}
        var signature = ''
        for (var _which in lists) signature += _which + ':' + Object.keys(lists[_which]).length + ','
        return signature
    }

    // Same names, same order as before: a later name overwrites an earlier one that is the same.
    static buildNames(){
        var table = Object.create(null)
        var wordRegex = /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g
        var vowels = 'aeijouy'
        var lists = (sk.ui.components && sk.ui.components.lists) || {}

        for (var _which in lists){
            for (var component in lists[_which]){
                table[component] = {component: component, full: true}

                var acronym = ''
                var words = component.match(wordRegex) || []
                for (var i = 0; i < words.length; i++) acronym += words[i][0]
                table[acronym] = {component: component, full: false}
                table[acronym.toLowerCase()] = {component: component, full: false}

                var firstChar = component.toLowerCase()[0]
                var firstIdx = (vowels.indexOf(firstChar) > -1 ? 0 : 1)
                table[firstChar + component.replace(/[aeijouy]/gi, '').substr(firstIdx, 999)] = {component: component, full: false}
            }
        }
        return table
    }

    addComponent_func(component, cb, extraOpt = {}){
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

        var _c = new _component({parent: this.opt.parent, extraOpt: extraOpt})
        
        this.add(_c)

        if (cb) cb(_c)

        return _c
    }
}