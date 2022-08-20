class JSOM_ {
    constructor(){
        this.isObject = value => value &&  (Object.prototype.toString.call(value) === "[object Object]" || "object" === typeof value || value instanceof Object)
        this.isFunction = value => value && (Object.prototype.toString.call(value) === "[object Function]" || "function" === typeof value || value instanceof Function)

        this.properties = {
            text: 'textContent',
            html: 'innerHTML'
        }
        this.trySetProperty = (element, key, value) => {
            //checks if value is a sfull length string or short string version of a predefined element property
            //if it is, it sets the value to the element

            var sanitized = this.properties[key]
            if (!sanitized) sanitized = key
            for (var key_ in this.properties)
                if (this.properties[key_] === sanitized){
                    element[sanitized] = value
                    return true
                }

            return
        }


        var t = this


        this.parsers = {
            object_v1: (opt)=>{
                
                opt.root.bucket = {}
                var bucket = opt.root.bucket
        
                function parseEvents(element, events){
                    for (var event in events){
                        var func = events[event]
                        if (t.isFunction(func)){
                            element.addEventListener(event, func)
                        } else {
                            var eventsBucket = opt.tree.eventsBucket
                            if (!eventsBucket) return console.error(`Events Bucket does not exist`)

                            var eventInBucket = eventsBucket[event]
                            if (!eventInBucket) return console.error(`${event} does not exist in Events Bucket`)
                            if (!t.isFunction(eventInBucket)) return console.error(`${event} in Events Bucket is not a function`)
                            element.addEventListener(func, eventInBucket)
                        }
                    }
                }
        
        
                function parseAttribute(element, key, value){
                    if (t.trySetProperty(element, key, value)) return
        
                    //if (key === 'id' && document.getElementById(value)) console.warning(`Element with ID has ${value} already been created`)
                        
                    element.setAttribute(key, value)
                }

                function parseStyling(element, value){
                    if (!value) return element.classList.remove('jsomElement')
                    var styles = value.split(' ')
                    var combos = {
                        tl: ['top' , 'left'  ], t: ['top'   , 'center'], tr: ['top'  , 'right' ],
                         l: ['left', 'middle'], c: ['center', 'middle'],  r: ['right', 'middle'],
                        bl: ['left', 'bottom'], b: ['bottom', 'center'], br: ['right', 'bottom'],

                        f: ['fill'], w: ['wrap'],

                        ttb: ['ttb'], btt: ['btt'],

                        sb: ['sb'], sa: ['sa'], se: ['se'],

                        s: ['scrollable']
                    }

                    /*var removables = {
                        ns: ['scrollable']
                    }*/

                    for (var s in styles){
                        var style = styles[s]
                        for (var c in combos[style]){
                            var combo = combos[style][c]
                            element.classList.add('jsomStyle_' + combo)
                        }

                        /*for (var r in removables[style]){
                            var removable = removables[style][r]
                            element.classList.remove('jsomStyle_' + removable)
                        }*/
                    }
                        
                }
        
                var firstObject = true

                function setupElement(element){
                    element.transition = animation => { return new Promise(resolve => { $(element).transition({animation: animation, duration: 190, onComplete: ()=>{resolve()}}) }) }
                }

                function parseObject(tree, root, prepend){
                    

                    for (var key in tree){
                        if (key == 'actions' || key == 'eventsBucket') continue
        
                        var value = tree[key]
        
                        if (key == 'styling'){
                            parseStyling(root, value)
                            root.stylingSet = true
                            continue
                        }

                        
        
                        var isObject = t.isObject(value)
                        if (!isObject){
                            parseAttribute(root, key, value)
                            continue
                        }
        
                        if (key == 'events'){
                            parseEvents(root, value)
                            continue
                        }

                       
                        var split = key.split('_')
        
                        var tag = split[0]
        
                        split.splice(0,1)
                        split[1] = split.join('_')
                        var id_add = (split[1] ? {id: split[1]} : undefined)
        
        
                        function addEntry(key, value){
                            root[key] = value
                            bucket[key] = value
                        }
                       
                        if (id_add.id == ''){
                            //console.log()
                        }
                        if (tag.length > 0){
                            var element = document.createElement(tag)
                            
                            element.parent = root
                            element.mainBucket = opt.root.bucket

                          
                            if (prepend && firstObject) root.prepend(element)
                            else root.appendChild(element)
                            firstObject = false

                            parseObject({...id_add, ...value}, element)
                            
                            element.classList.add('jsomElement')

                            if (!value.title) element.title = ''

                            addEntry(id_add.id, element)

                            setupElement(element)
                        } else {
                            var cb = value
                            if (t.isFunction(cb)){
                                var return_ = cb(root)
                                if (return_){
                                    addEntry(id_add.id, return_)
                                }
                            } else {
                                addEntry(id_add.id, value)
                            }
                        }

                        
                    }
                }
        
                parseObject(opt.tree, opt.root, opt.prepend)
            },


            array_v1: ()=>{
                
            }
        }
    }

    parse(opt){
        var parser = (opt.parser ? opt.parser : this.parsers.object_v1)
        parser(opt)
        return opt.root.bucket
    }
}




var JSOM = new JSOM_()