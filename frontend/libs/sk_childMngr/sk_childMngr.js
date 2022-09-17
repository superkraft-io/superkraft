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
        
        for (var _which in sk.ui.components.lists){
            var _cList = sk.ui.components.lists[_which]
            for (var _component in _cList) this.addComponent(_component)
        }
    }



    addComponent(component){
        this.addComponent_fullname(component)
        this.addComponent_acronym(component)
        this.addComponent_antiVowel(component)
    }

    addComponent_fullname(component){
        this.opt.parent.add[component] = cb => {
            return this.addComponent_func(component, cb)
        }
    }

    addComponent_acronym(component){
        const wordRegex = /[A-Z]?[a-z]+|[0-9]+|[A-Z]+(?![a-z])/g
        var split = component.match(wordRegex)

        var acronym = ''
        split.forEach(_w => {
            acronym += _w[0]
        })

        //if (this.opt.parent.add[acronym]) console.warn(`Acronymized component name already exists: ${component} -> ${acronym}`)
        //if (this.opt.parent.add[acronym.toLowerCase()]) console.warn(`Lowercase acronymized component name already exists: ${component} -> ${acronym.toLowerCase()}`)

        this.opt.parent.add[acronym] = cb => { return this.addComponent_func(component, cb) }
        this.opt.parent.add[acronym.toLowerCase()] = cb => { return this.addComponent_func(component, cb) }
    }

    addComponent_antiVowel(component){
        var vowels = 'aeijouy'
        var firstChar = component.toLowerCase()[0]
        var firstIdx = (vowels.indexOf(firstChar) > -1 ? 0 : 1)
        var name = firstChar + component.replace(/[aeijouy]/gi, '').substr(firstIdx, 999)
        
        //if (this.opt.parent.add[name]) console.warn(`Antivoweled component name already exists: ${component} -> ${name}`)
        
        this.opt.parent.add[name] = cb => {
            return this.addComponent_func(component, cb)
        }
    }

    addComponent_func(component, cb){
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