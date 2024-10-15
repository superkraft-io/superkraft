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

        var _classes = ['sk_ui_component', 'sk_ui_noSelect', 'sk_ui_transition', 'sk_ui_os_' + sk.os, 'sk_ui_' + sk.browser()]

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

        
        

        try {
            if (opt.extraOpt.onBeforeCreate) opt.extraOpt.onBeforeCreate(this)
        } catch(err) {
            console.error(err)
            console.error('[sk_ui_component] Critical error!')
        }

        
        /******    Attributes    ******/

        if (this.constructor.name === 'sk_ui_component'){
            this.attributes.add({friendlyName: 'Pseudo Class', name: 'pseudoClassName',  type: 'text', onSet: val => {
                this.onPseudoClassSet(val)
            }})
        }


        this.attributes.add({
            friendlyName: 'Disabled',
            name: 'disabled',
            type: 'bool',

            onSet: val => {
                if (val){
                    this.pointerEvents = 'none'
                    this.__prevOpacity = this.opacity || 1
                    this.opacity = 0.5
                } else {
                    this.pointerEvents = ''
                    this.opacity = this.__prevOpacity
                }
            }
        })

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
                {value: 'wrap'}
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
            var speed =  (val === true ? 'normal' : val)

            var speedsNumbers = {
                slow   : 3000,
                normal : 1500,
                fast   : 750
            }
            var speedsNumber = speedsNumbers[speed]


            clearTimeout(this.__pulsateTimer)

            if (!val){
                this.opacity = this.__prePulsateOpacity
                this.style.transition = ''
                return
            }

            this.style.transition = (speedsNumber - 1) + 'ms'
            

            this.__prePulsateOpacity = this.style.opacity

            var setMin = ()=>{ this.style.opacity = 0.25 }
            var setMax = ()=>{ this.style.opacity = 1 }

            var nextIsMin = true

            var doNext = ()=>{
                this.__pulsateTimer = setTimeout(()=>{
                    if (nextIsMin) setMin()
                    else setMax()

                    nextIsMin = !nextIsMin

                    if (this.pulsate) doNext()
                }, speedsNumber)
            }

            doNext()
        }})


        this.sortableOptionsDefault = {
            sort: true,  // sorting inside list,
            animation: 250
        }
        this.sortableOptions = {}
        this.attributes.add({friendlyName: 'Sortable', name: 'sortable', type: 'bool', onSet: val => {
            if (!val) return
            
            //resource: https://github.com/SortableJS/Sortable#cdn

            this.__sortableObj = new Sortable(this.element, {...this.sortableOptionsDefault, ...this.sortableOptions, ...{
               
                onStart: _e => {
                    sk.fileDrop.bypass = true
                    this.__sort_oldIdx = _e.oldIndex
                    _e.item.sk_ui_obj.animate = false
                    if (this.onSortStart) this.onSortStart(_e, _e.item.sk_ui_obj)
                },
            
                onEnd: _e => {
                    sk.fileDrop.bypass = false
                    _e.item.sk_ui_obj.animate = true
                    if (this.onSortEnd) this.onSortEnd(_e, _e.item.sk_ui_obj)
                },
            
            
                // Called when dragging element changes position
                onChange: _e => {
                    _e.newIndex // most likely why this event is used is to get the dragging element's current index
                    // same properties as onEnd
                }
            }})
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


        this.attributes.add({friendlyName: 'Tab Index', name: 'tabIndex', type: 'number', onSet: val => {
            this.element.setAttribute('tabIndex', val)
            if (val === -1) {
                this.classAdd('sk_ui_component_tabIndex-1')
            } else {
                this.classRemove('sk_ui_component_tabIndex-1')
            }
        }})

        this.tabIndex = -1



        /*******************/


        var clearCursorEvents = ()=>{
            this.element.removeEventListener('mouseenter', this.cursorEvents.onEnter)
            this.element.removeEventListener('mouseleave', this.cursorEvents.onLeave)
            document.removeEventListener('mousemove', this.cursorEvents.onMove)
        }

        this.cursorEvents = {
            onEnter: _e => {
                if (this.cursor.length === 0){
                    clearCursorEvents()
                    return
                }

                var cursor = sk.cursors[this.cursor]

                if (this.cursor !== '_' && cursor == undefined) return

                this.classAdd('sk_ui_component_hideCursor')

                this.removeAllCursors()

                if (cursor){
                    sk.app.cursorEl = sk.app.add.component(_c => {
                        _c.classAdd('sk_ui_component_cursor')
                        _c.animate = false
                        _c.compact = true

                        _c.icon = _c.add.icon(_c => {
                            _c.icon = cursor.url
                            if (cursor.size) _c.size = cursor.size
                        })

                        _c.offset = {x: 0, y: 0}
                        if (cursor.onCreated) cursor.onCreated(_c)
                    })
                } else {
                    sk.app.cursorEl = sk.app.add.component(_c => {
                        _c.classAdd('sk_ui_component_cursor')
                        _c.animate = false
                        _c.compact = true
                        _c.offset = {x: 0, y: 0}
                    })
                }

                if (this.onCursorCreated) this.onCursorCreated(sk.app.cursorEl)
            },
            
            onLeave: _e => {
                if (_e.toElement && _e.toElement.classList.value.includes('sk_ui_eventBlocker')) return
                this.classRemove('sk_ui_component_hideCursor')
                if (sk.app.cursorEl) sk.app.cursorEl.remove()
            },

            onMove: _e => {
                if (!sk.app.cursorEl) return

                var cursor = sk.cursors[this.cursor] || {offset: {x: 0, y: 0}}
                
                var offset = cursor.offset || {x: 0, y: 0}
                if (!offset.x) offset.x = 0
                if (!offset.y) offset.y = 0

                var pos = sk.interactions.getPos(_e)
               
                sk.app.cursorEl.style.left = pos.x + offset.x + 'px'
                sk.app.cursorEl.style.top = pos.y + offset.y + 'px'
            }
        }


        this.attributes.add({friendlyName: 'Cursor', name: 'cursor', type: 'text', onSet: val => {

            
            
            //delete sk.app.eventBlocker.onCursorCreated
            //sk.app.eventBlocker.style.cursor = ''

            

            if (val.length === 0){
                this.style.cursor = ''
                //sk.app.eventBlocker.style.cursor = ''
                sk.app.eventBlocker.removeCursorFor(this)

                if (sk.app.cursorEl) sk.app.cursorEl.remove()
                clearCursorEvents()

                return
            }

            var cssCursors = ['', 'none', 'auto', 'crosshair', 'default', 'e-resize', 'grab', 'help', 'move', 'n-resize', 'ne-resize', 'nw-resize', 'pointer', 'progress', 's-resize', 'se-resize', 'sw-resize', 'text', 'w-resize', 'wait', 'not-allowed', 'no-drop']
            
            if (cssCursors.includes(val)){
                //sk.app.eventBlocker.style.cursor = val
                sk.app.eventBlocker.setCursorFor(this, val)
                this.style.cursor = val
                return
            }
            
            if (sk.cursors[val] || val === '_'){
                //sk.app.eventBlocker.onCursorCreated = this.onCursorCreated
                //sk.app.eventBlocker.style.cursor = 'none'
                sk.app.eventBlocker.setCursorFor(this)

                this.element.addEventListener('mouseenter', this.cursorEvents.onEnter)
                this.element.addEventListener('mouseleave', this.cursorEvents.onLeave)
                document.addEventListener('mousemove', this.cursorEvents.onMove)
            }
        }})









        /********/

        sk.ui.components.uuid_counter++
        this.uuid = 'sk_ui_id_' + sk.ui.components.uuid_counter

        if (this.onFileDrop) sk.fileDrop.subscribe(this)



        this.classAdd(this.classHierarchy.join(' '))
        this.classAdd('sk_ui_cannotMoveView')

        this.styling = 'center middle'
        this.vertical = true


        this.contextMenu = new SK_ContextMenu({parent: this})
        this.ums = new SK_UMS_Client()
        if (!opt.noHint) this._hint = new SK_Hint({parent: this})

            
        /********/

        //continue construction. used by plugins to extend capabilities
        if (this.__sk_ui_continue_constructor__) this.__sk_ui_continue_constructor__(opt)



        /*
        const resizeObserver = new ResizeObserver((entries) => {
            this.__rect = this.getRect()
        })

        resizeObserver.observe(this.element)
        */
            
        if (sk.onAfterComponentCreated) sk.onAfterComponentCreated(this)
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

    set focused(val) {
        if (val) this.element.focus()
        else this.element.blur()
    }

    get focused() {
        return document.activeElement.id === this.element.id
    }

    getPath(opt = {}){
        var path = []

        var getParentOf = _c => {
            if (opt.target){
                path.push(_c)
            } else {
                path.push((opt && opt.elements ? _c.element : _c))
            }

            if (_c.parent) getParentOf(_c.parent)
        }

        getParentOf((opt.target ? opt.target : this))

        return path
    }


    moveBefore(target){
        target.element.before(this.element)
    }


    removeAllCursors(showNativeCursor){
        var allCursors = document.querySelectorAll('.sk_ui_component_cursor')
        for (var i in allCursors){
            var cursorEl = allCursors[i]
            var suo = cursorEl.sk_ui_obj
            if (suo) suo.remove()
        }

        if (showNativeCursor) this.classRemove('sk_ui_component_hideCursor')
    }
    
    async remove(opt){
        this.movres_izer.destroy()

        if (this.cursor) this.removeAllCursors(true)

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
        if (!this.parent.classHas) return
        return (this.parent.classHas('sk_ui_iceRink') ? this.parent : this.parent.getParentIceRink())
    }

    scrollTo(non_sk, center){
        var parentIceRink = this.getParentIceRink()

        if (!parentIceRink || non_sk) return this.element.scrollIntoView({behavior: "smooth"})

        parentIceRink.scrollToChild(this, center)
    }

    scrollToIfNotFullyVisible(non_sk, center){
        if (!this.rect.localPos.isFullyVisible) this.scrollTo(non_sk, center)
    }

    get __rect(){
        if (!this.__rect) this.__rect = this.getRect()
        return this.__rect
    }

    get rect(){
        var inViewport = (rect)=>{
            var html = document.documentElement;
          
            return !!rect &&
              rect.bottom >= 0 &&
              rect.right >= 0 && 
              rect.left <= html.clientWidth &&
              rect.top <= html.clientHeight;
        }

        var res = this.element.getBoundingClientRect()
        var parentRect = this.parent.element.getBoundingClientRect()

        res.localPos = new (
            class sk_ui_component_localRect {
                constructor(){
                    this.x = res.left - parentRect.left
                    this.y = res.top - parentRect.top
                }

                get isFullyVisible(){
                    if (this.x < 0) return false
                    if (this.y < 0) return false
                    if (this.x + res.width > parentRect.width) return false
                    if (this.y + res.height > parentRect.height) return false

                    return true
                }
            }
        )


        res.inView = inViewport(res)

       
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
            for (var i = 0; i < this.children.children.length; i++){
                var child = this.children.children[i]
                json.children.push(child.serialize(child.multiComponent, includeThis))
            }
        }
        

        return json
    }

    deserialize(){

    }

    setOnFileDrop(opt){
        this.onFileDrop = opt
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

    findByID(id, val){
        for (var cat in this.categories.list){
            var category = this.categories.list[cat]
            var res = category.findByID(id, val)
            if (res) return res
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

    findByID(id, val){
        for(var i in this.attributes){
            var attr = this.attributes[i]
            var info = attr.info
            if (info[id] === val) return attr
        }
    }

    add(info){
        var existing = this.findByID('name', info.name)
        
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

        try {
            var attribute = Object.defineProperty(
                parent,
                info.name,
                {
                    get: ()=>{
                        if (info.css) var val = parent.style[info.css.split('?')[0]]
                        else var val = parent['__' + info.name]
                        
                        var _val = this.iterateCallbacks('get', val)
                        
                        return (_val === undefined ? val : _val)
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
        } catch(err) {
            var x = 0
        }

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



//movres_izer
class sk_ui_movableizer_resizableizer {
    constructor(opt){
        this.opt = opt
        this.parent = opt.parent
        
        this.mover = new sk_ui_movableizer(opt)
        this.mover.coreParent = this
        this.mover.onStart = res => { if (this.onStartMoving) this.onStartMoving(res) }
        this.mover.onEnd = ()=>{ if (this.onEndMoving) this.onEndMoving() }
        this.mover.onMoving = res => { if (this.onMoving) this.onMoving(res) }

        this.resizer = new sk_ui_resizableizer(opt)
        this.resizer.coreParent = this
        this.resizer.onStart = ()=>{ if (this.onStartResizing) this.onStartResizing() }
        this.resizer.onEnd = ()=>{ if (this.onEndResizing) this.onEndResizing() }
        this.resizer.onResizing = res => { if (this.onResizing) this.onResizing(res) }
        this.resizer.onResizingSnappingBegin = ()=>{ if (this.onResizingSnappingBegin) this.onResizingSnappingBegin() }
        this.resizer.onResizingSnappingEnd = ()=>{ if (this.onResizingSnappingEnd) this.onResizingSnappingEnd() }



        this.mouseMoveHandler = _e => {
            if (this.resizer.resizing || this.mover.moving) return
    
            if (!this.mover.moving && this.resizer.axis){
                var test = this.resizer.testPoint(_e)
                if (this.onCanResize) this.onCanResize()
                if (test){
                    this.resizer.trackMouseLeave(true)
                    this.canMove = false
                    this.canResize = true
    
                    
                    _e.preventDefault()
                    _e.stopPropagation()
                    
                    return true
                }
            }
            
            this.resizer.trackMouseLeave(false)
    
        
            
            this.canResize = false
            this.canMove = true
    
            //_e.preventDefault()
            //_e.stopPropagation()
            
        }
    
    
        this.mouseUpHandler = _e => {
            _e.sk_origin = 'movres_izer'
            
            if (this.parent && this.parent.onMouseUp) this.parent.onMouseUp(_e)
            
            document.removeEventListener('mouseup', this.mouseUpHandler)
            document.removeEventListener('touchend',  this.mouseUpHandler)
            sk.interactions.unblock()
        }
    
        this.handleMouseDown = _e => {
            if (this.mover.moving || this.resizer.resizing) return
    
            _e.sk_origin = 'movres_izer'
            
            if (this.parent && this.parent.onMouseDown) this.parent.onMouseDown(_e)
            
            var hookEvents = ()=>{
                _e.preventDefault()
                _e.stopPropagation()
        
                
                document.addEventListener('mouseup',  this.mouseUpHandler )
                document.addEventListener('touchend',  this.mouseUpHandler )
            }
            
    
            if (this.resizer.testPoint(_e)){
                hookEvents()
                this.canMove = false
                this.canResize = true
                this.resizer.mouseDownHandler(_e)
                sk.interactions.block()
            } else {
                if (this.mover.axis){
                    hookEvents()
                    this.canResize = false
                    this.canMove = true
                    this.mover.mouseDownHandler(_e)
                }
            }
        }
    }

    destroy(){
        this.off()
        this.mover.off()
        this.resizer.off()
        sk.interactions.unblock()
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

    set snapToGrid(val){
        this.mover.__snapToGrid = val
        this.resizer.__snapToGrid = val
    }

    set gridSnapWidth(val){
        this.mover.__gridSnapWidth = val
        this.resizer.__gridSnapWidth = val
    }

    tryOn(){
        if (this.active) return
        this.on()
    }

    tryOff(){
        if (this.moveAxis || this.resizeAxis) return
        this.off()
        this.mover.off()
        this.resizer.off()
    }

    on(){
        if (this.active) return

        this.active = true

        this.parent.element.addEventListener('mousemove', this.mouseMoveHandler )
        this.parent.element.addEventListener('touchmove', this.mouseMoveHandler )

        this.parent.element.addEventListener('mousedown', this.handleMouseDown )
        this.parent.element.addEventListener('touchstart', this.handleMouseDown )
        
        this.parent.element.addEventListener('mouseup',  this.mouseUpHandler )
        this.parent.element.addEventListener('touchend',  this.mouseUpHandler )
    }

    off(){
        sk.interactions.unblock()

        this.active = false

        this.parent.element.removeEventListener('mouseup', this.mouseUpHandler)
        this.parent.element.removeEventListener('touchend', this.mouseUpHandler)
        
        document.removeEventListener('mouseup', this.mouseUpHandler)
        document.removeEventListener('touchend', this.mouseUpHandler)

        this.parent.element.removeEventListener('mousedown', this.handleMouseDown )
        this.parent.element.removeEventListener('touchstart', this.handleMouseDown )
        
        this.parent.element.removeEventListener('mousemove', this.mouseMoveHandler)
        this.parent.element.removeEventListener('touchmove', this.mouseMoveHandler)
        
        document.removeEventListener('mousemove', this.mouseMoveHandler)
        document.removeEventListener('touchmove', this.mouseMoveHandler)
    }

    calcSnap(opt){
        var halfGrid = (opt.gridSize / 2)
        var wrapX = sk.utils.wrapNum(opt.gridSize, opt.pos)
        if (wrapX > halfGrid) wrapX = 0 - (halfGrid - (wrapX - halfGrid))
        var smoothMove = (wrapX < 0-opt.gridSnapWidth || wrapX > opt.gridSnapWidth)

        if (opt.gridSize && !smoothMove) return sk.utils.calcSnap({val: opt.pos, gridSize: opt.gridSize})
        return opt.pos
    }
}

class sk_ui_movableizer {
    constructor(opt){
        this.opt = opt
        this.parent = opt.parent

        this.__gridSnapWidth = 10

        this.constraints = {
            x: {},
            y: {}
        }
        this.offset = {x: 0, y: 0}

        this.multiplier = {x: 1, y: 1}

        this.mouseUpHandler = _e => {
            _e.preventDefault()
            _e.stopPropagation()

            this.off()


            this.mdPos = undefined
            
            this.parent.animate = this.animateTmp
            
            this.moving = false
            
            this.parent.pointerEvents = 'true'
    
            if (this.onStartNotified && this.onEnd) this.onEnd(_e)

            sk.interactions.unblock()
        }
    

        this.mouseMoveHandler = _e => {            
            if (!this.mdPos) return

            
            

            _e.preventDefault()
            _e.stopPropagation()

            this.moving = true

            var mousePosInSelf = {
                x: (_e.clientX || _e.touches[0].clientX) - this.mdPosGlobal.x,
                y: (_e.clientY || _e.touches[0].clientY) - this.mdPosGlobal.y
            }


            mousePosInSelf.x *= this.multiplier.x
            mousePosInSelf.y *= this.multiplier.y

            if (!this.onStartNotified && this.onStart){
                this.onStartNotified = true
                this.onStart({
                    event: _e,
                    position: this.mdPos,
                })
            }

            var newPos = {
                x: mousePosInSelf.x + this.offset.x + this.originalPos.x,
                y: mousePosInSelf.y + this.offset.y + this.originalPos.y
            }

            

            if (!_e.shiftKey){
                newPos.x = this.coreParent.calcSnap({
                    gridSize: this.__snapToGrid,
                    gridSnapWidth: this.__gridSnapWidth,
                    pos: newPos.x
                })
            }

            if (this.axis.indexOf('x') > -1){
                //if (newPos.x < 0 - this.offset.x) newPos.x = 0
                //if (newPos.x > this.parent.parent.rect.width - this.parent.rect.width + this.offset.x) newPos.x = this.parent.parent.rect.width - this.parent.rect.width + this.offset.x
                //this.parent.style.left = Math.round(newPos.x - this.offset.x) + 'px'

                var minX = 0
                var maxX = this.parent.parent.rect.width - this.parent.rect.width + this.offset.x
                if (this.constraints){
                    if (this.constraints.x){
                        if (this.constraints.x.min === Infinity) minX = Infinity
                        if (this.constraints.x.min) minX = this.constraints.x.min
                        
                        if (this.constraints.x.max === Infinity) maxX = Infinity
                        else if (this.constraints.x.max) maxX = this.constraints.x.max
                    }
                }

                if (minX !== Infinity && newPos.x < minX) newPos.x = minX
                if (maxX !== Infinity && newPos.x > maxX) newPos.x = maxX
                this.parent.style.left = Math.round(newPos.x) + 'px'
            }
    
            if (this.axis.indexOf('y') > -1){
                var minY = 0
                var maxY = this.parent.parent.rect.height - this.parent.rect.height + this.offset.y
                if (this.constraints){
                    if (this.constraints.y){
                        if (this.constraints.y.min === Infinity) minY = Infinity
                        if (this.constraints.y.min) minY = this.constraints.y.min
                        
                        if (this.constraints.y.max === Infinity) maxY = Infinity
                        else if (this.constraints.y.max) maxY = this.constraints.y.max
                    }
                }

                if (minY !== Infinity && newPos.y < minY) newPos.y = minY
                if (maxY !== Infinity && newPos.y > maxY) newPos.y = maxY
                this.parent.style.top = Math.round(newPos.y) + 'px'
            }
 

            var diff = {
                x: newPos.x - this.originalPos.x,
                y: newPos.y - this.originalPos.y
            }

            if (this.onMoving) this.onMoving({
                event: _e,
                position: newPos,
                diffPos: diff,
                cancel: ()=>{
                    this.mouseUpHandler(_e)
                }
            })
        }
        


        this.mouseDownHandler = (_e)=>{
            if (this.bypass) return

            sk.interactions.block()

            this.onStartNotified = false
            this.mdPosGlobal = {
                x: (_e.clientX || _e.touches[0].clientX),
                y: (_e.clientY || _e.touches[0].clientY)
            }

            this.mdPos = {
                x: this.mdPosGlobal.x - this.parent.rect.x,
                y: this.mdPosGlobal.y - this.parent.rect.y
            }

            
           
            this.originalPos = this.parent.rect.localPos


            this.originalPos.x *= this.multiplier.x
            this.originalPos.y *= this.multiplier.y
    
            this.animateTmp = this.parent.animate
            
    
            this.parent.pointerEvents = 'none'
    
            document.addEventListener('mousemove', this.mouseMoveHandler)
            document.addEventListener('touchmove', _e => this.mouseMoveHandler(_e) ) //works but may/will cause issues, since this event handler never gets removed
            
            document.addEventListener('mouseup', this.mouseUpHandler)
            document.addEventListener('touchend', this.mouseUpHandler)
        }

        
        
    }

    off(){
        sk.interactions.unblock()
        
        this.parent.element.removeEventListener('mousemove', this.mouseMoveHandler)
        this.parent.element.removeEventListener('touchmove', this.mouseMoveHandler)
        
        this.parent.element.removeEventListener('mouseup', this.mouseUpHandler)
        this.parent.element.removeEventListener('touchend', this.mouseUpHandler)

        document.removeEventListener('mousemove', this.mouseMoveHandler)
        document.removeEventListener('touchmove', this.mouseMoveHandler)
        
        document.removeEventListener('mouseup', this.mouseUpHandler)
        document.removeEventListener('touchend', this.mouseUpHandler)
    }
}


class sk_ui_resizableizer {
    constructor(opt){
        this.opt = opt
        this.parent = opt.parent
        
        this.__gridSnapWidth = 10

        this.__border = 6
        this.sides = {}

        this.allowedSides = {
            left: true,
            top: true,
            right: true,
            bottom: true
        }

        this.mouseMoveHandler = _e => {
            _e.preventDefault()
            _e.stopPropagation()

            var diff = {
                x: (_e.clientX || _e.touches[0].clientX) - this.mdPos.x,
                y: (_e.clientY || _e.touches[0].clientY) - this.mdPos.y
            }


            var newPos = {
                x: parseFloat((this.originalPos.x + diff.x).toFixed(0)),
                y: parseFloat((this.originalPos.y + diff.y).toFixed(0))
            }

            
            if (this.sides.right) newPos.x = this.originalPos.x
            if (this.sides.bottom) newPos.y = this.originalPos.y


            var newSize = {
                w: this.originalSize.w - diff.x,
                h: this.originalSize.h + diff.y
            }



            var halfGrid = (this.__snapToGrid / 2)

            if (this.sides.left) var wrapVal = newPos.x
            if (this.sides.right) var wrapVal = this.originalPos.x + this.originalSize.w + diff.x
            var wrapW = sk.utils.wrapNum(this.__snapToGrid, wrapVal) //change newPos.x to diff.x to use relative snapping
            if (wrapW > halfGrid) wrapW = 0 - (halfGrid - (wrapW - halfGrid))
            var doSnap = false
            if (wrapW > 0-this.__gridSnapWidth && wrapW < 0) doSnap = 'left'
            if (wrapW >= 0 && wrapW < this.__gridSnapWidth) doSnap = 'right'
     

            
            if (!doSnap){
                if (!this.__snapping){
                    if (this.onResizingSnappingBegin){
                        this.__snapping = true
                        this.onResizingSnappingBegin()
                    }
                }
            } else {
                if (this.__snapping){
                    if (this.onResizingSnappingEnd){
                        this.__snapping = false
                        this.onResizingSnappingEnd()
                    }
                }
            }

            if (!this.__snapToGrid || !doSnap){
                if (this.sides.right) newSize.w = this.originalSize.w + diff.x
                if (this.sides.top) newSize.h = this.originalSize.h - diff.y
            } else {

                var originalPosX_snapped = sk.utils.calcSnap({val: this.originalPos.x, gridSize: this.__snapToGrid})
                var diffPosX = originalPosX_snapped - this.originalPos.x

                if (this.sides.left){
                    var posSnapX = sk.utils.calcSnap({
                        val: newPos.x - originalPosX_snapped,
                        gridSize: this.__snapToGrid
                    })
                    newPos.x = this.originalPos.x + posSnapX + diffPosX

                    var deltaPos = newPos.x - this.originalPos.x
                    newSize.w = this.originalSize.w - deltaPos
                    
                    

                    this.parent.style.left = newPos.x + 'px' 
                }
                else if (this.sides.right){
                    //newSize.w = sk.utils.calcSnap({val: newSize.w - this.originalSize.w, gridSize: this.__snapToGrid})
                    var deltaPos = newPos.x - this.originalPos.x
                    newSize.w = sk.utils.calcSnap({
                        //val: this.originalSize.w + diff.x - originalPosX_snapped, //working somewhat. bugs our when left side is close to left snap zone
                        val: this.originalPos.x + this.originalSize.w + diff.x,
                        gridSize: this.__snapToGrid
                    }) - this.originalPos.x
                }
            }

            if (this.constraints){
                if (this.constraints.width){
                    if (this.constraints.width.min && newSize.w < this.constraints.width.min) newSize.w = this.constraints.width.min
                    if (this.constraints.width.max && newSize.w > this.constraints.width.max) newSize.w = this.constraints.width.max

                    
                    if (this.constraints.width.max !== undefined && this.constraints.width.max !== Infinity && newSize.w >= this.parent.parent.rect.width - newPos.x) newSize.w = this.parent.parent.rect.width - newPos.x
                }

                if (this.constraints.height){
                    if (this.constraints.height.min && newSize.h < this.constraints.height.min) newSize.h = this.constraints.height.min
                    if (this.constraints.height.max && newSize.h > this.constraints.height.max) newSize.h = this.constraints.height.max

                    if (this.constraints.heigh.max !== undefined && this.constraints.heigh.max !== Infinity && newSize.h >= this.parent.parent.rect.heigh - newPos.y) newSize.h = this.parent.parent.rect.heigh - newPos.y
                }
            }


            var mover = this.parent.movres_izer.mover
            var moverConstraints = mover.constraints

            if (this.sides.right || this.sides.left){
                if (this.axis.indexOf('x') > -1){
                    if (this.sides.left){
                        if (moverConstraints){
                            if (moverConstraints.x){
                                if (moverConstraints.x.min !== undefined && moverConstraints.x.min !== Infinity){
                                    if (newPos.x <= moverConstraints.x.min) newPos.x = moverConstraints.x.min
                                }
                            }
                        }

                        this.parent.style.left = newPos.x + 'px'
                    }


                    
                    this.parent.style.minWidth = newSize.w + 'px'
                    this.parent.style.maxWidth = newSize.w + 'px'
                }
            }

            if (this.sides.top || this.sides.bottom){
                if (this.axis.indexOf('y') > -1){
                    if (this.sides.top){
                        if (moverConstraints){
                            if (moverConstraints.y){
                                if (moverConstraints.y.min !== undefined && moverConstraints.y.min !== Infinity){
                                    if (newPos.y <= moverConstraints.y.min) newPos.y = moverConstraints.y.min
                                }
                            }
                        }

                        this.parent.style.top = newPos.y + 'px'
                    }
                    this.parent.style.minHeight = newSize.h + 'px'
                    this.parent.style.maxHeight = newSize.h + 'px'
                }
            }

            var diffSize = {
                x: newSize.w - this.originalSize.w,
                y: newSize.h - this.originalSize.h,
            }
            if (this.onResizing) this.onResizing({
                event: _e,
                size: newSize,
                diffSize: diffSize,
                sides: this.sides,
                cancel: ()=>{
                    this.mouseUpHandler(_e)
                }
            })
        }
    
    
        this.mouseUpHandler = _e => {
            _e.preventDefault()
            _e.stopPropagation()

            this.resizing = false
            this.mdPos = undefined

            this.parent.animate = this.animateTmp

            document.body.style.cursor = ''

           this.off()

            if (this.onEnd) this.onEnd()
        }
    }

    testPoint(_e){
        if (!this.axis) return

        var pos = {
            x: (_e.clientX || _e.touches[0].clientX) - this.parent.rect.left,
            y: (_e.clientY || _e.touches[0].clientY) - this.parent.rect.top
        }

        this.sides = {}

        if (this.axis.indexOf('x') > -1){
            if (pos.x < this.__border && this.allowedSides.left) this.sides.left = true
            if (pos.x > this.parent.rect.width - this.__border && this.allowedSides.right) this.sides.right = true
        }

        if (this.axis.indexOf('y') > -1){
            if (pos.y < this.__border && this.allowedSides.top) this.sides.top = true
            if (pos.y > this.parent.rect.height - this.__border && this.allowedSides.bottom) this.sides.bottom = true
        }

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

    
    off(){
        sk.interactions.unblock()
        
        document.removeEventListener('mousemove', this.mouseMoveHandler)
        document.removeEventListener('touchmove', this.mouseMoveHandler)
        
        document.removeEventListener('mouseup', this.mouseUpHandler)
        document.removeEventListener('touchend', this.mouseUpHandler)
    }

    



    mouseDownHandler(_e){
        this.resizing = true

        this.mdPos = {
            x: (_e.clientX || _e.touches[0].clientX),
            y: (_e.clientY || _e.touches[0].clientY)
        }


        this.originalPos = this.parent.rect.localPos


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
    
        if (this.onStart) this.onStart()
    }

    trackMouseLeave(enabled){
        if (sk.isOnMobile) return

        if (!enabled){
            this.parent.element.removeEventListener('mouseleave', this.mouseLeaveHandler)
            return
        }

        this.mouseLeaveHandler = _e => {
            if (this.mdPos) return
            document.body.style.cursor = ''
            this.cursor = ''
        }

        this.parent.element.addEventListener('mouseleave', this.mouseLeaveHandler)
    }
}


