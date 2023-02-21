class sk_ui_component {
    constructor(opt){
        this.sk_ui_opt = opt
        this.parent = this.sk_ui_opt.parent
        this.parentClassName = Object.getPrototypeOf(this.constructor).name

        this.attributes = new sk_ui_attributes(this)
        //this.events = new sk_ui_mouseEventsMngr({parent: this})

        this.children = new SK_ChildMngr({parent: this})
        
        
        
        this.bucket = JSOM
        
        

        var tree = {}
        var htmlTag = opt.htmlTag  || 'div'

        var _classes = ['sk_ui_component', 'sk_ui_transition', 'sk_ui_noSelect', 'sk_ui_os_' + sk.os, 'sk_ui_' + sk.browser()]

        if (sk.isOnMobile){
            _classes.push('sk_ui_isOnMobile')
            if (sk.mobile.isStandalone) _classes.push('sk_ui_isMobileStandalone sk_ui_mobile_noScroll')
            _classes.push('sk_ui_mobile_orientation_' + sk.mobile.orientation)
            _classes.push(sk.mobile.getDeviceClasses())
        }
        
        tree[htmlTag + '_element'] = { class: _classes.join(' '), styling: 'c' }
        this.bucket = JSOM.parse({root: this.parent.element, tree: tree})

        

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
        
        this.__animate = true
        this.attributes.add({friendlyName: 'Animate', name: 'animate',  type: 'bool', onSet: val => {
            this.classRemove('sk_ui_transition')
            if (val) this.classAdd('sk_ui_transition')
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
                    this.classAdd('sk_ui_frosted')
                    if (val !== 'clear') this.classAdd('sk_ui_face_color')
                } else {
                    this.classRemove('sk_ui_frosted sk_ui_face_color')
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
        

        this.attributes.add({friendlyName: 'Pointer Events', name: 'pointerEvents',  type: 'text', onSet: val => {
            this.style.pointerEvents = ''
            if (val) this.style.pointerEvents = val
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


        this.attributes.add({friendlyName: 'Emphasise', name: 'emphasise', type: 'bool', onSet: val => {
            this.classRemove('sk_ui_glow_pulse')
            if (val) this.classAdd('sk_ui_glow_pulse')
        }})

        this.attributes.add({friendlyName: 'Pulsate', name: 'pulsate', type: 'bool', onSet: val => {
            var speeds = ['slow', 'normal', 'fast']
            this.classRemove(speeds.join(' sk_ui_pulsate_'))
            if (val) this.classAdd('sk_ui_pulsate' + (val !== true ? '_' + val : '_normal'))
        }})

        this.attributes.add({friendlyName: 'Sortable', name: 'sortable', type: 'bool', onSet: val => {
            if (!val) return
            
            $('#' + this.element.id).sortable({
                placeholder: 'sk_ui_component_sortable_placeholder sk_ui_pulsate sk_ui_glow_pulse',
                connectWith: val,
                start: (_e, _ui)=>{
                    _ui.item[0].sk_ui_obj.animate = false
                    if (this.onSortStart) this.onSortStart(_e, _ui)
                },

                stop: (_e, _ui)=>{
                    _ui.item[0].sk_ui_obj.animate = true
                    if (this.onSortEnd) this.onSortEnd(_e, _ui)
                }, 
            })

            try {
                var collaborators = val.split(' ')
                for (var i in collaborators) $('#' + this.element.id).sortable('option', 'connectWith', collaborators[i])
            } catch(err) {

            }
        }})





        this.movres_izer = new sk_ui_movableizer_resizableizer({parent: this})

        this.attributes.add({friendlyName: 'Movable', name: 'movable', type: 'text', onSet: val => {
            if (val === false) return this.movres_izer.moveAxis = undefined

            if (val === true) val = 'xy'

            this.movres_izer.moveAxis = val
        }})

        this.attributes.add({friendlyName: 'Resizable', name: 'resizable', type: 'text', onSet: val => {
            if (val === false) return this.movres_izer.resizeAxis = undefined

            if (val === true) val = 'xy'

            this.movres_izer.resizeAxis = val
        }})

        /********/

        sk.ui.components.uuid_counter++
        this.uuid = 'sk_ui_id_' + sk.ui.components.uuid_counter

        if (this.onFileDrop) sk.fileDrop.subscribe(this)



        this.classAdd(this.classHierarchy.join(' '))
        this.classAdd('sk_ui_cannotMoveView')

        this.styling = 'center middle'
        this.vertical = true


        //this.contextMenu = new sk_ui_contextMenuMngr(this)
        this.contextMenu = new SK_ContextMenu({parent: this})
        this.ums = new SK_UMS_Client()
        if (!opt.noHint) this._hint = new SK_Hint({parent: this})

        /********/

        //continue construction. used by plugins to extend capabilities
        if (this.__sk_ui_continue_constructor__) this.__sk_ui_continue_constructor__(opt)
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

        return _classHierarchy
    }

    getPath(opt){
        var path = []

        var getParentOf = _c => {
            path.push((opt && opt.elements ? _c.element : _c))
            if (_c.parent) getParentOf(_c.parent)
        }

        getParentOf(this)

        return path
    }


    moveBefore(target){
        target.element.before(this.element)
    }

    async remove(opt){
        if (opt) if (opt.animation) await this.hide(opt)

        if (this._hint) this._hint.hide()

        this.ums.clear()
        sk.fileDrop.unsubscribe(this)
        

        if (this.onBeforeRemove) await this.onBeforeRemove(this)
        this.children.clear()
        this.element.remove()
        this.parent.children.delete(this.child_idx)

        if (this.onRemove) this.onRemove(this)
    }

    setup(cb){
        cb(this)
        return this
    }

    hideAnimation(opt){
        return new Promise(resolve => {
            if (opt.dimension === 'width') this.width = 0.1
            else if (opt.dimension === 'width') this.height = 0.1
            this.opacity = 0.001
            this.style.transform = 'scale(0)'
            setTimeout(()=>{ resolve() }, 250)
        })
    }

    show(opt){
        return new Promise(resolve =>{
            if (!opt || (opt && !opt.animation)){
                this.element.style.display = ''
                return resolve()
            }

            this.classRemove('sk_ui_transition')
            
            var rect =  this.rect
            this.width = rect.width
            this.height = rect.height

            var getCSSVal = prop => { return getComputedStyle(this.element).getPropertyValue(prop) }
            var currentValues = {
                size: {width: getCSSVal('width'),  height: getCSSVal('height') },
                padding: {left: getCSSVal('padding-left'), top: getCSSVal('padding-top'), right: getCSSVal('padding-right'), bottom: getCSSVal('padding-bottom')},
                margin: {left: getCSSVal('margin-left'), top: getCSSVal('margin-top'), right: getCSSVal('margin-right'), bottom: getCSSVal('margin-bottom')}
            }

            if (opt.animation === 'width'){
                this.width = 0.01
                this.paddingLeft = 0.01
                this.paddingRight = 0.01
            } else if (opt.animation === 'height'){
                this.height = 0.01
                this.paddinTop = 0.01
                this.paddingBottom = 0.01
            }

            
            this.style.transform = 'scale(0)'

            setTimeout(()=>{
                this.classAdd('sk_ui_transition')

                if (opt.animation === 'width'){
                    this.style.width        = currentValues.size.width
                    this.style.marginRight  = currentValues.margin.right
                    this.style.paddingLeft  = currentValues.padding.left
                    this.style.paddingRight = currentValues.padding.right
                } else if (opt.animation === 'height'){
                    this.style.height        = currentValues.size.height
                    this.style.marginBottom  = currentValues.margin.bottom
                    this.style.paddinTop     = currentValues.padding.top
                    this.style.paddingBottom = currentValues.padding.bottom
                }

                this.opacity = opt.maxOpacity || 0
                this.style.transform = ''

                setTimeout(()=>{
                    resolve()
                }, 210)

                setTimeout(()=>{
                    return
                    this.style.width        = ''
                    this.style.marginRight  = ''
                    this.style.paddingLeft  = ''
                    this.style.paddingRight = ''

                    this.style.height        = ''
                    this.style.marginBottom  = ''
                    this.style.paddinTop     = ''
                    this.style.paddingBottom = ''
                    resolve()
                }, 500)
            }, 5)
        })
    }
    
    hide(opt){
        return new Promise(resolve =>{
            if (!opt || (opt && !opt.animation)){
                this.element.style.display = 'none'
                return resolve()
            }

            var rect =  this.rect
            this.width = rect.width
            this.height = rect.height

            
            this.opacity = 0.01
            this.style.transform = 'scale(0)'

            var doHide = ()=>{
                if (opt.animation === 'width'){
                    this.width = 0.01
                    this.marginRight = 0.01
                    this.paddingLeft = 0.1
                    this.paddingRight = 0.1
                } else if (opt.animation === 'height'){
                    this.height = 0.01
                    this.marginBottom = 0.01
                    this.paddinTop = 0.1
                    this.paddingBottom = 0.1
                }
            }
            setTimeout(()=>{ doHide() }, 10)

            setTimeout(()=>{ resolve() }, 225)
        })
    }


    getParentIceRink(){
        return (this.parent.classHas('sk_ui_iceRink') ? this.parent : this.parent.getParentIceRink())
    }

    scrollTo(){
        var parentIceRink = this.getParentIceRink()

        if (!parentIceRink) return this.element.scrollIntoView({behavior: "smooth"})

        parentIceRink.scrollToChild(this)
    }

    get rect(){
        // new `IntersectionObserver` constructor
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries){
                this.__bounds = entry.boundingClientRect
            }

            observer.disconnect();
        })

        observer.observe(this.element)

        var inViewport = ()=>{
            var html = document.documentElement;
            //var rect = this.__bounds
            var rect = this.element.getBoundingClientRect();
          
            return !!rect &&
              rect.bottom >= 0 &&
              rect.right >= 0 && 
              rect.left <= html.clientWidth &&
              rect.top <= html.clientHeight;
        }
          
        //var res = this.__bounds
        var res = this.element.getBoundingClientRect()
        res.inView = inViewport()

        return res
    }
    
    hint(opt){
        this._hint.config(opt)
    }

    

    classAdd(val = ''){
        val.split(' ').forEach(_class => {
            try { this.element.classList.add(_class) } catch(err) {}
        })
    }
    classRemove(val = ''){ val.split(' ').forEach(_class => { try { this.element.classList.remove(_class) } catch (err) { }}) }
    classHas(val = ''){ return this.element.classList.contains(val) }


    async blink(){
        for (var i = 0; i < 2; i++){
            this.classAdd('sk_ui_blinkClr')
            await sk.utils.sleep(150)
            this.classRemove('sk_ui_blinkClr')
            await sk.utils.sleep(150)
        }
    }

    
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



    hideShow(opt){
        return new Promise(async resolve =>{
            var animation = opt.animation || 'fade'
            
            if (opt.onBefore) await opt.onBefore()

            var handleAnim = direction => {
                return new Promise(resolve => {
                    this.transition(animation + ' ' + direction)
                    for (var i in opt.with) opt.with[i].transition(animation + ' ' + direction)

                    setTimeout(()=>{ resolve() }, 200)
                })
            }

            await handleAnim('out')
            
            if (opt.onHidden) await opt.onHidden()

            await handleAnim('in')

            if (opt.onDone) await opt.onDone()

            resolve()
        })
    }

    async hideShow_2(opt){
        var currentPulsateState = this.pulsate
        this.pulsate = false
        var currentOpacity = this.opacity
        try { 
            if ((parseFloat(currentOpacity)*10000) < 10000) currentOpacity = 1
        } catch(err) {
            currentOpacity = 1
        }
        this.opacity = 0.01
        await sk.utils.sleep(200)

        await opt.onHidden()
        
        this.opacity = currentOpacity
        await sk.utils.sleep(200)
        this.pulsate = currentPulsateState
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
                    
                    var _val = this.iterateCallbacks('get', val)
                    
                    return _val || val
                },

                set: val => {
                    if (info.css){
                        var newVal = val + info.css.split('?')[1]
                        if (val === 0) newVal = ''
                        parent.style[info.css.split('?')[0]] = newVal
                    } else {
                        if (parent['__' + info.name] === val) return
                        parent['__' + info.name] = val
                    }

                    this.iterateCallbacks('set', val)
                }
            }
        )

        this.info = info

        if (info.onSet) this.callbacks.set.push(info.onSet)
        if (info.onGet) this.callbacks.get.push(info.onGet)

        if (info.default) parent['__' + info.name] = info.default
    }

    iterateCallbacks(which, value){
        var returnVal = undefined

        if (which === 'set') this.callbacks.set.forEach(_cb => { _cb(value) })
        else this.callbacks.get.forEach(_cb => { returnVal = _cb(value) })

        return returnVal
    }
}




/*********/


class sk_ui_contextMenuMngr {
    constructor(parent){
        this.parent = parent

        this.activeWhenParentDisabled = false
        this.__button = 'right'
    }

    set items(val){
        if (!this.__items) this.setEventListener()
        this.__items = val
    }

    get items(){ return this.__items }

    set button(val){ this.__button = val }

    setEventListener(){

        var shouldIgnore = path => {
            if (this.parent.element.id === path[0].id) return false

            if (path[0].tagName === 'INPUT') return true

            for (var i in path){
                var element = path[i]
                
                try {
                    var suo = element.sk_ui_obj
                    var cm = suo.contextMenu
                    if (this.parent.element.id === element.id) return false
                    if (cm.items) return true
                    if (cm.blockPropagation) return true
                } catch(err) {
                }
            }

            return
        }

        this.parent.element.addEventListener('contextmenu', _e => {
            if (shouldIgnore(_e.path)) return
            _e.preventDefault()
            if (this.__button === 'right') this.handleMouseEvent(_e)
        })
        this.parent.element.addEventListener('click', _e => { if (this.__button === 'left') this.handleMouseEvent(_e) })
    }

    handleMouseEvent(_e){
        if (this.parent.disabled && !this.activeWhenParentDisabled) return
        this.show(_e)
    }

    show(_e){
        var items = undefined
        
        if (this.__items instanceof Function){
            items = this.__items()
        } else {
            items = this.__items
        }

        if (!items) return

        sk._cM.show({
            pos    : {x: _e.clientX, y: _e.clientY},
            sender : this.parent.element,
            items  : items
        })
    }
}




//Movableizer

class sk_ui_movableizer_resizableizer {
    constructor(opt){
        this.opt = opt
        this.parent = opt.parent
        
        this.mover = new sk_ui_movableizer(opt)
        this.mover.onStart = ()=>{ if (this.onStart) this.onStart() }
        this.mover.onEnd = ()=>{ if (this.onEnd) this.onEnd() }
        this.mover.onMoving = res => { if (this.onMoving) this.onMoving(res) }

        this.resizer = new sk_ui_resizableizer(opt)
        this.resizer.onResizing = res => { if (this.onResizing) this.onResizing(res) }
    }

    set moveAxis(val){
        if (!val) return this.tryOff()
        this.mover.axis = val
        this.tryOn()
    }

    set resizeAxis(val){
        if (!val) return this.tryOff()
        this.resizer.axis = val
        this.tryOn()
    }


    tryOn(){
        if (this.active) return
        this.on()
    }

    tryOff(){
        if (this.moveAxis || this.resizeAxis) return
        this.off()
    }

    on(){
        console.log('ACTIVATING')
        this.active = true

        this.parent.element.addEventListener('mousemove', _e => this.mouseMoveHandler(_e) )
        this.parent.element.addEventListener('touchmove', _e => this.mouseMoveHandler(_e) )

        this.parent.element.addEventListener('mousedown', _e => this.handleMouseDown(_e) )
        this.parent.element.addEventListener('touchstart', _e => this.handleMouseDown(_e) )
        
        this.parent.element.addEventListener('mouseup',  _e => this.mouseUpHandler(_e) )
        this.parent.element.addEventListener('touchend',  _e => this.mouseUpHandler(_e) )
    }

    off(){
        this.active = false

        this.parent.element.removeEventListener('mouseup', this.mouseUpHandler)
        this.parent.element.removeEventListener('touchend', this.mouseUpHandler)
        
        document.removeEventListener('mouseup', this.mouseUpHandler)

        
        this.parent.element.removeEventListener('mousemove', this.mouseMoveHandler)
        this.parent.element.removeEventListener('touchmove', this.mouseMoveHandler)
        
        document.removeEventListener('mousemove', this.mouseMoveHandler)
        document.removeEventListener('touchmove', this.mouseMoveHandler)
    }

    /************/


   

    mouseMoveHandler(_e){
        if (this.resizing) return

        _e.preventDefault()
        _e.stopPropagation()

        if (this.resizer.testPoint(_e)){
            this.canMove = false
            return this.canResize = true
        }

        

        this.canResize = false

        this.canMove = true
    }


    mouseUpHandler(_e){        
        this.resizing = false
        this.moving = false
    }

    handleMouseDown(_e){
        if (!this.canResize && !this.canMove) return
        
        _e.preventDefault()
        _e.stopPropagation()

        if (this.canResize){
            this.resizing = true
            this.resizer.mouseDownHandler(_e)
        } else {
            this.moving = true
            this.mover.mouseDownHandler(_e)
        }
    }
}

class sk_ui_movableizer {
    constructor(opt){
        this.opt = opt
        this.parent = opt.parent


        this.mouseUpHandler = _e => {
            _e.preventDefault()
            _e.stopPropagation()

            this.parent.element.removeEventListener('mousemove', this.mouseMoveHandler)
            this.parent.element.removeEventListener('touchmove', this.mouseMoveHandler)
            
            this.parent.element.removeEventListener('mouseup', this.mouseUpHandler)
            this.parent.element.removeEventListener('touchend', this.mouseUpHandler)

            document.removeEventListener('mousemove', this.mouseMoveHandler)
            document.removeEventListener('touchmove', this.mouseMoveHandler)
            
            document.removeEventListener('mouseup', this.mouseUpHandler)
            document.removeEventListener('touchend', this.mouseUpHandler)


            this.mdPos = undefined
            
            this.parent.animate = this.animateTmp
            
            this.moving = false
    
            if (this.onEnd) this.onEnd(_e)
        }
    
        this.mouseMoveHandler = _e => {  
            _e.preventDefault()
            _e.stopPropagation()
            
            var diff = {
                x: this.mdPos.x - ((_e.clientX || _e.touches[0].clientX) - this.parent.parent.rect.left) - this.origin.x,
                y: this.mdPos.y - ((_e.clientY || _e.touches[0].clientY) - this.parent.parent.rect.top) - this.origin.y
            }
    
            var newPos = {
                x: this.mdPos.x - diff.x,
                y: this.mdPos.y - diff.y
            }
            
    
            if (newPos.x < 0) newPos.x = 0
            //if (newPos.x > this.parent.rect.width - this.parent.parent.rect.width) newPos = this.parent.parent.rect.width - this.parent.rect.width
    
            if (newPos.y < 0) newPos.y = 0
            //if (newPos.y > this.parent.rect.height - this.parent.parent.rect.height) newPos = this.parent.parent.rect.height - this.parent.rect.height
    
            if (this.axis.indexOf('x') > -1) this.parent.style.left = newPos.x + 'px'
            if (this.axis.indexOf('y') > -1) this.parent.style.top = newPos.y + 'px'

            if (this.onMoving) this.onMoving({event: _e, position: newPos})
        }
    }

    mouseDownHandler(_e){
        this.mdPos = {
            x: (_e.clientX || _e.touches[0].clientX) - this.parent.parent.rect.left,
            y: (_e.clientY || _e.touches[0].clientY) - this.parent.parent.rect.top
        }

        this.origin = {
            x: this.parent.rect.left - this.parent.parent.rect.left - this.mdPos.x,
            y: this.parent.rect.top - this.parent.parent.rect.top - this.mdPos.y,
        }

        this.animateTmp = this.parent.animate
        this.parent.animate = false
        

        this.parent.element.addEventListener('mousemove', this.mouseMoveHandler)
        this.parent.element.addEventListener('touchmove', this.mouseMoveHandler)
        
        this.parent.element.addEventListener('mouseup', this.mouseUpHandler)
        this.parent.element.addEventListener('touchend', this.mouseUpHandler)


        document.addEventListener('mousemove', this.mouseMoveHandler)
        document.addEventListener('touchmove', this.mouseMoveHandler)
        
        document.addEventListener('mouseup', this.mouseUpHandler)
        document.addEventListener('touchend', this.mouseUpHandler)


        if (this.onStart) this.onStart(_e)
    }
}


class sk_ui_resizableizer {
    constructor(opt){
        this.opt = opt
        this.parent = opt.parent
        
        this.border = 6
        this.sides = {}



        this.mouseMoveHandler = _e => {
            _e.preventDefault()
            _e.stopPropagation()

            var diff = {
                x: (_e.clientX || _e.touches[0].clientX) - this.mdPos.x,
                y: (_e.clientY || _e.touches[0].clientY) - this.mdPos.y
            }

            if (this.sides.left){
                this.parent.style.left = this.originalPos.x + diff.x + 'px'
                diff.x = 0-diff.x
            }
            
            if (this.sides.top){
                this.parent.style.top = this.originalPos.y + diff.y
                diff.y = 0-diff.y
            }


            var newSize = {
                w: this.originalSize.w + diff.x,
                h: this.originalSize.h + diff.y
            }


            if (this.axis.indexOf('x') > -1) this.parent.style.minWidth = newSize.w + 'px'
            if (this.axis.indexOf('y') > -1) this.parent.style.maxWidth = newSize.w + 'px'
            

            if (this.onResizing) this.onResizing({size: newSize})
        }
    
    
        this.mouseUpHandler = _e => {
            console.log('document mouse up')

            this.mdPos = undefined

            this.parent.animate = this.animateTmp

            document.body.style.cursor = ''

            document.removeEventListener('mousemove', this.mouseMoveHandler)
            document.removeEventListener('touchmove', this.mouseMoveHandler)
            
            document.removeEventListener('mouseup', this.mouseUpHandler)
            document.removeEventListener('touchend', this.mouseUpHandler)

            if (this.onEnd) this.onEnd()
        }
    }

    testPoint(_e){
        var pos = {
            x: (_e.clientX || _e.touches[0].clientX) - this.parent.rect.left,
            y: (_e.clientY || _e.touches[0].clientY) - this.parent.rect.top
        }

        this.sides = {}

        if (pos.x < this.border) this.sides.left = true
        if (pos.x > this.parent.rect.width - this.border) this.sides.right = true

        if (pos.y < this.border) this.sides.top = true
        if (pos.y > this.parent.rect.height - this.border) this.sides.bottom = true

        this.cursor = ''

        if (this.sides.left){
            this.cursor = 'ew-resize'
            if (this.sides.top) this.cursor = 'nwse-resize'
            if (this.sides.bottom) this.cursor = 'nesw-resize'
        } else if (this.sides.right){
            this.cursor = 'ew-resize'
            if (this.sides.top) this.cursor = 'nesw-resize'
            if (this.sides.bottom) this.cursor = 'nwse-resize'
        } else if (this.sides.top || this.sides.bottom){
            this.cursor = 'ns-resize'
        }

        document.body.style.cursor = this.cursor

        return this.cursor !== ''
    }

    


    



    mouseDownHandler(_e){
        this.mdPos = {
            x: (_e.clientX || _e.touches[0].clientX),
            y: (_e.clientY || _e.touches[0].clientY)
        }


        this.originalPos = {
            x: this.parent.rect.left - this.parent.parent.rect.left,
            y: this.parent.rect.top - this.parent.parent.rect.top
        }


        this.originalSize = {
            w: this.parent.rect.width,
            h: this.parent.rect.height
        }

        this.animateTmp = this.parent.animate
        this.parent.animate = false
        
        

        document.addEventListener('mousemove', this.mouseMoveHandler)
        document.addEventListener('touchmove', this.mouseMoveHandler)
        
        document.addEventListener('mouseup', this.mouseUpHandler)
        document.addEventListener('touchend', this.mouseUpHandler)
    }
}


