class sk_ui_component {
    constructor(parent){
        this.parent = parent
        this.parentClassName = Object.getPrototypeOf(this.constructor).name

        this.attributes = new sk_ui_attributes(this)
        

        this.children = new sk_ui_childList()
        this.children.parent = this
        this.add = {
            fromNew: (sk_ui_class, cb) => {
                var obj = new sk_ui_class(this)
                this.children.add(obj)
                if (cb) cb(obj)
                return obj
            }
        }
        var addComponent = component => {
            this.add[component] = cb => {
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
        
                var _c = new _component(this)
                
                this.children.add(_c)
        
                if (cb) cb(_c)
        
                return _c
            }
        }
        
        for (var _which in sk.ui.components.lists){
            var _cList = sk.ui.components.lists[_which]
            for (var _component in _cList) addComponent(_component)
        }
        
        
        this.bucket = JSOM
        
        

        this.bucket = JSOM.parse({root: parent.element,
            tree: { div_element: { class: 'sk_component transition noSelect', styling: 'c' }}
        })

        

        this.element = this.bucket.element
        this.element.sk_ui_obj = this
        this.style = this.element.style

        this.transition = this.element.transition

        
        

        /******    Attributes    ******/

        if (this.constructor.name === 'sk_ui_component'){
            this.attributes.add({friendlyName: 'Pseudo Class', name: 'pseudoClassName',  type: 'text', onSet: val => {
                this.onPseudoClassSet(val)
            }})
        }

        this.attributes.add({notEditable: true, friendlyName: 'Multi Comp.', name: 'multiComponent',  type: 'bool'})

        
        this.attributes.add({friendlyName: 'Vertical', name: 'vertical',  type: 'bool', onSet: val => {
            this.classRemove('sk_ui_component_spaced_horizontal')
            this.classRemove('sk_ui_component_spaced_vertical')

            if (val === false){
                this.styling = this.styling.replace('ttb', ' ')
                this.classAdd('sk_ui_component_spaced_horizontal')
            } else if (val === true) {
                if (this.styling.indexOf('ttb') < 0) this.styling = this.styling + ' ttb'
                this.classAdd('sk_ui_component_spaced_vertical')
            }
        }})

        this.attributes.add({friendlyName: 'Compact', name: 'compact',  type: 'bool', onSet: val => {
            this.classRemove('sk_ui_component_spaced_horizontal')
            this.classRemove('sk_ui_component_spaced_vertical')
            
            if (!val) this.classAdd('sk_ui_component_spaced' + (this.vertical ? '_vertical' : '_horizontal'))
        }})
        

        this.attributes.add({friendlyName: 'ID', name: 'uuid',  type: 'text', onSet: val => {
            this.classRemove(this.element.id)
            this.element.id = val
            this.classAdd(this.element.id)
            if (this.onUUIDSet) this.onUUIDSet(val)
        }})

        this.attributes.add({
            notEditable: true,
            friendlyName: 'Styling',
            name: 'styling',
            type: 'list',
            items: [
                {value: 'left'},
                {value: 'top'},
                {value: 'right'},
                {value: 'bottom'},
                {name: 'Horizontal center', value: 'center'},
                {name: 'Vertical center', value: 'middle'},
                {name: 'Top-to-bottom', value: 'ttb'},
                {name: 'Bottom-to-top', value: 'btt'},
                {value: 'fill'},
                {value: 'fullwidth'},
                {value: 'fullheight'},
            ],

            onSet: val => {
                this._styling = val.replace('undefined', '')
                var stylingsList = ['top' , 'left', 'center', 'right',  'middle', 'bottom', 'fill', 'wrap', 'ttb', 'btt', 'sb', 'sa', 'se', 'scrollable', 'fullwidth', 'fullheight']
                for (var i in stylingsList) this.element.classList.remove('jsomStyle_' + stylingsList[i])

                var newStylings = val.split('undefined').join('').split(' ')
               
                for (var i = 0; i < newStylings.length; i++) this.element.classList.add('jsomStyle_' + newStylings[i])
            }
        })

        this.attributes.add({
            friendlyName: 'Frosted',
            name: 'frosted',
            type: 'list',
            items: [
                {name: 'Off', value: undefined},
                {name: 'On', value: true},
                {name: 'Clear', value: 'clear'}
            ],
    
            onSet: val => {
                if (val){
                    this.classAdd('frosted')
                    if (val !== 'clear') this.classAdd('face_color')
                } else {
                    this.classRemove('frosted face_color')
                }
            }
        })

        this.attributes.add({friendlyName: 'Fade Indicate', name: 'fade_indicate',  type: 'bool', onSet: val => {
            this.classRemove('sk_ui_fade_indicate')
            if (val) this.classAdd('sk_ui_fade_indicate')
        }})

        this.attributes.add({friendlyName: 'Can Move View', name: 'canMoveView',  type: 'bool', onSet: val => {
            this.classRemove('sk_ui_canMoveView')
            this.classAdd('sk_ui_cannotMoveView')
            if (val){
                this.classAdd('sk_ui_canMoveView')
                this.classRemove('sk_ui_cannotMoveView')
            }
        }})


        this.attributes.categories.new({name: 'CSS'}, _cat => {
            _cat.add({
                friendlyName: 'Roundness',
                name: 'roundness',
                type: 'number',
                css: 'border-radius?px'
            })

            _cat.add({
                friendlyName: 'Padding',
                name: 'padding',
                type: 'number',
                css: 'padding?px'
            })

            _cat.add({
                friendlyName: 'Margin',
                name: 'margin',
                type: 'number',
                css: 'margin?px'
            })

            _cat.add({
                friendlyName: 'Color',
                name: 'backgroundColor',
                type: 'color',
                css: 'background-color?'
            })
            
            _cat.add({
                friendlyName: 'Opacity',
                name: 'opacity',
                type: 'number',
                css: 'opacity?',
                units: {min: 0, max: 1, step: 0.1}
            })

            _cat.add({
                friendlyName: 'Width',
                name: 'width',
                type: 'number',
                css: 'width?px',
                units: {min: 1, max: 512, step: 1}
            })

            _cat.add({
                friendlyName: 'Height',
                name: 'height',
                type: 'number',
                css: 'height?px',
                units: {min: 1, max: 512, step: 1}
            })
        })
    
        var capFirst = str => {return str[0].toUpperCase() + str.substr(1, str.length) }

        var addQuadAttr = (opt, onSet)=>{
            var addAttr = (cat, name) => {
                cat.add({
                    friendlyName: capFirst(name),
                    name: opt.cssName + capFirst(name),
                    type: 'number',
                    css: (this.style[opt.cssName] !== undefined ? opt.cssName + '-' + name + '?px' : undefined),
                    onSet: val => { if (onSet) onSet(val, name) }
                })
            }

            this.attributes.categories.new({name: opt.friendlyName, horizontal: true}, _cat => {
                opt.labels.forEach(_label => { addAttr(_cat, _label)})
            })
        }
        
        addQuadAttr({friendlyName: 'Padding', cssName: 'padding', labels: ['left', 'top', 'right', 'bottom']})
        addQuadAttr({friendlyName: 'Margin', cssName: 'margin', labels: ['left', 'top', 'right', 'bottom']})
        
        /*addQuadAttr({friendlyName: 'Child Margin', labels: ['left', 'top', 'right', 'bottom']}, (val, attrName)=>{
            this.children.forEach(_child => {
                var _cP = capFirst(attrName)
                var css = 'margin' + _cP
                _child[css] = val
            })
        })*/

        /********/

        sk.ui.components.uuid_counter++
        this.uuid = 'sk_ui_id_' + sk.ui.components.uuid_counter

        if (this.onFileDrop) sk.fileDrop.subscribe(this)



        this.classAdd(this.classHierarchy.join(' '))
        this.classAdd('sk_ui_cannotMoveView')

        this.styling = 'center middle'
        this.vertical = true


        this.contextMenu = new sk_ui_contextMenuMngr(this)

        /********/

        //continue construction. used by plugins to extend capabilities
        if (this.__sk_ui_continue_constructor__) this.__sk_ui_continue_constructor__(parent)
    }

    get classHierarchy(){
        var _classHierarchy = []
        var checkNextParent = current => {
            var prototype = Object.getPrototypeOf(current)
            if (prototype.prototype) prototype = prototype.prototype
            var protoConstructor = prototype.constructor
            var className = protoConstructor.name
            
            if (className === 'sk_ui_component' || className === 'Function') return
            
            _classHierarchy.push(className)
            checkNextParent(protoConstructor)
        }
        checkNextParent(this)

        _classHierarchy.push('sk_ui_component')

        if (sk.isOnMobile) _classHierarchy.push('sk_ui_isOnMobile')

        return _classHierarchy
    }


    moveBefore(target){
        target.element.before(this.element)
    }

    async remove(){
        if (this.onBeforeRemove) await this.onBeforeRemove(this)

        sk.fileDrop.unsubscribe(this)
        this.children.clear()
        this.element.remove()
        this.parent.children.delete(this.child_idx)
        
        if (this.onRemove) this.onRemove(this)
    }

    setup(cb){
        cb(this)
        return this
    }

    show(){
        this.element.style.display = ''
    }
    
    hide(){
        this.element.style.display = 'none'
    }

    scrollTo(){
        this.element.scrollIntoView({behavior: "smooth"})
    }

    get rect(){ return this.element.getBoundingClientRect() }
    
    hint(text, position = '', decoupled){
        if (position === '') position = 'bottom center'

        this._hint = {text: text, pos: position}

        

        var orientation = 'horizontal'
        var hintInfo = {
            calc: ()=>{
                hintInfo.rect = this.hintBucket.element.getBoundingClientRect()
            }
        }

        var parentInfo = {
            calc: ()=>{
                parentInfo.rect = this.element.getBoundingClientRect()
                parentInfo.pos = {
                    x: parentInfo.rect.left + window.scrollX,
                    y: parentInfo.rect.top + window.scrollY
                }
            }
        }
        
        var margin = 6

        var calcPos = {

            left: (secondOperation)=>{
                calcPos.result.x = parentInfo.pos.x - hintInfo.rect.width - margin
                if (secondOperation && calcPos.secondIsASide) calcPos.result.x += hintInfo.rect.width + margin

                if (!secondOperation) calcPos.result.animation = 'left'

                if (calcPos.result.x < 0) calcPos.right()
            },

            right: (secondOperation)=>{
                calcPos.result.x = parentInfo.pos.x + parentInfo.rect.width + margin
                if (secondOperation && calcPos.secondIsASide) calcPos.result.x -= hintInfo.rect.width + margin

                if (!secondOperation) calcPos.result.animation = 'right'

                if (calcPos.result.x > document.body.clientWidth) calcPos.left()
            },

            top: (secondOperation)=>{
                orientation = 'vertical'
                
                calcPos.result.y = parentInfo.pos.y - hintInfo.rect.height - margin
                if (secondOperation && calcPos.secondIsASide) calcPos.result.y += hintInfo.rect.height + margin

                if (!secondOperation) calcPos.result.animation = 'up'

                if (calcPos.result.x < 0) calcPos.bottom()
            },

            bottom: (secondOperation)=>{
                orientation = 'vertical'
                
                calcPos.result.y = parentInfo.pos.y + parentInfo.rect.height + margin
                if (secondOperation && calcPos.secondIsASide) calcPos.result.y -= hintInfo.rect.height + margin

                if (!secondOperation) calcPos.result.animation = 'down'

                if (calcPos.result.y > document.body.clientHeight) calcPos.left()
            },

            center: ()=>{
                if (orientation === 'vertical'){
                    calcPos.result.x = parentInfo.pos.x + (parentInfo.rect.width/2) - (hintInfo.rect.width/2)
                    return
                }

                calcPos.result.y = parentInfo.pos.y + (parentInfo.rect.height/2) - (hintInfo.rect.height/2)
            },

            result: {
                x: 0,
                y: 0
            }
        }

        var positions = position.split(' ')
        if (positions[0] === 'center') positions = [positions[1], positions[0]]
        calcPos.secondIsASide = positions[1] !== 'center'
        var positionFuncs = {
            a: calcPos[positions[0]],
            b: calcPos[positions[1]]
        }
        
        
        var hintTimer = undefined
        var hintActivated = false



        var showHint = autohide => {
            if (this.hintBucket) return

            clearTimeout(this.hintHider)
            
            this.hintBucket = JSOM.parse({root: document.body,
                tree: { div_element: { class: 'sk_ui_hint noSelect frosted', style: 'display: none;', styling: 'c', text: text }}
            })

            this.hintBucket.element.transition('fade ' + calcPos.result.animation + ' in')

            parentInfo.calc()
            hintInfo.calc()

            positionFuncs.a()
            positionFuncs.b(true)

            this.hintBucket.element.style.left = calcPos.result.x + 'px'
            this.hintBucket.element.style.top = calcPos.result.y + 'px'

            if (!autohide) return

            this.hintHider = setTimeout(async ()=>{
                await hideHint()
            }, 3000)
        }

        var hideHint = ()=>{
            return new Promise(async resolve => {
                if (!this.hintBucket) return resolve()

                await this.hintBucket.element.transition('fade ' + calcPos.result.animation + ' out')
                this.hintBucket.element.remove()
                this.hintBucket = undefined
                resolve()
            })
        }


        if (decoupled){
            showHint(true)
            return
        }

        this.element.addEventListener('mouseenter', ()=>{
            hintTimer = setTimeout(()=>{
                showHint()
                hintActivated = true
            }, 200)
        })

        this.element.addEventListener('mouseleave', ()=>{
            clearTimeout(hintTimer)
            if (!hintActivated) return
            hideHint()
        })
    }

    

    classAdd(val){  $(this.element).addClass(val) }
    classRemove(val){  $(this.element).removeClass(val) }


    serialize(ignoreChildren, includeThis, ignoreCSS){
        //serialize this
        var json = {
            class: this.constructor.name,
            parentClass: this.parentClassName,
            children: [],
            attributes: this.attributes.serialize(ignoreCSS),
            id: this.uuid,
            pseudoClassName: this.pseudoClassName
        }
        if (includeThis) json.component = this

        //serialize children
        if (!ignoreChildren){
            for (var i = 0; i < this.children.length; i++){
                var child = this.children[i]
                json.children.push(child.serialize(child.multiComponent, includeThis))
            }
        }
        

        return json
    }

    deserialize(){

    }

    setOnFileDrop(cb){
        this.onFileDrop = cb
        sk.fileDrop.subscribe(this)
    }
}


class sk_ui_childList extends Array {
    recalculateIndices(){
        for (var i = 0; i < this.length; i++) this[i].child_idx = i
    }

    add(obj){
        this.push(obj)
        this.recalculateIndices()
    }

    delete(idx){
        this.splice(idx, 1)
        this.recalculateIndices()
    }

    clear(){
        for (var i = this.length - 1; i > -1; i--) this[i].remove()
    }
}


class sk_ui_attributes {
    constructor(parent){
        this.parent = parent
        this.categories = new sk_ui_attributes_categories(this.parent)
    }

    add(info){
        var category = this.categories.addOrGet(info.name)
        category.add(info)
    }

    find(){
        var x = 0
    }

    findByFriendlyName(friendlyName){
        for (var cat in this.categories){
            var category = this.categories[cat]
            for (var i = 0; i < category.length; i++){
                var attribute = this.list[i]
            if (attribute.friendlyName === friendlyName) return attribute
            }
        }
    }

    serialize(ignoreCSS){
        var res = {}
        //serialize attributes
        for (var cat in this.categories.list){
            var category = this.categories.list[cat]
            for (var i = 0; i < category.attributes.length; i++){
                var attribute = category.attributes[i]
                var val = undefined
                try { val = this.parent[attribute.name] } catch(err) { }
                if (val){
                    var _name = attribute.name
                    var _attrRes = {value: val}
                    
                    if (attribute.css){
                        if (!ignoreCSS){
                            _name = attribute.css.split('?')[0]
                            _attrRes.css = true
                        } else {
                            _attrRes.value = _attrRes.value.replace(attribute.css.split('?')[1], '')
                        }
                    }
                    
                    res[_name] = _attrRes
                }
            }
        }

        return res
    }

    
}

class sk_ui_attributes_categories {
    constructor(parent){
        this.parent = parent
        this.list = {}
        this.new = this.addOrGet
    }

    addOrGet(info, cb){
        var targetCategory = info.name || 'general'
        var category = this.list[targetCategory]
        if (!category){
            this.list[targetCategory] = new sk_ui_attributes_category(this.parent, {...info, ...{name: targetCategory}})
            category = this.list[targetCategory]
        }
        if (cb) cb(category)
        return category
    }

    forEach(cb){
        for (var cat in this.list) cb(this.list[cat])
    }
}

class sk_ui_attributes_category {
    constructor(parent, info){
        this.parent = parent
        this.name = info.name
        this.horizontal = info.horizontal
        this.attributes = []
    }

    findByName(name){
        for(var i in this.attributes){
            var attr = this.attributes[i]
            if (attr.info.name === name) return attr
        }
    }

    add(info){
        var existing = this.findByName(info.name)
        
        if (existing){
            if (info.onSet) existing.callbacks.set.push(info.onSet)
            if (info.onGet) existing.callbacks.get.push(info.onGet)
        } else {
            this.attributes.push(new sk_ui_attribute(this.parent, info))
        }
    }
}

class sk_ui_attribute {
    constructor(parent, info){
        this.callbacks = {
            set: [],
            get: []
        }

        var attribute = Object.defineProperty(
            parent,
            info.name,
            {
                get: ()=>{
                    if (info.css) var val = parent.style[info.css.split('?')[0]]
                    else var val = parent['__' + info.name]
                    
                    this.iterateCallbacks('get', val)

                    return val
                },

                set: val => {
                    if (info.css){
                        var newVal = val + info.css.split('?')[1]
                        if (val === 0) newVal = ''
                        parent.style[info.css.split('?')[0]] = newVal
                    } else {
                        parent['__' + info.name] = val
                    }

                    this.iterateCallbacks('set', val)
                }
            }
        )

        this.info = info

        if (info.onSet) this.callbacks.set.push(info.onSet)
        if (info.onGet) this.callbacks.get.push(info.onGet)
    }

    iterateCallbacks(which, value){
        var failed = false
        this.callbacks[which].forEach(_cb => {
            _cb(value)
        })
    }
}




/*********/


class sk_ui_contextMenuMngr {
    constructor(parent){
        this.parent = parent

        this.activeWhenParentDisabled = false

        this.parent.element.addEventListener('contextmenu', _e => {
            if (!this.items) return
            if (this.parent.disabled && !this.activeWhenParentDisabled) return
            
            this.show(_e)
        })
    }

    show(_e){
        sk._cM.show({
            pos    : {x: _e.clientX, y: _e.clientY},
            sender : this.parent.element,
            items  : this.items
        })
    }
}