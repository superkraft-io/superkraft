class SK_UI_Component_Bakery {
    constructor(opt){
        this.opt = opt
    }

    asClass(){

        var gen = this.genChildren(this.opt.children, 1, true)

        var cssCode = this.genCSS(this.opt.class, this.opt.id, this.opt.attributes)

        var jsAttributes = this.genJS(this.opt.attributes, '    ', true)
        
        
        return {
            css: cssCode + '\n' + gen.css,
            js: `class ${this.opt.class} extends ${this.opt.parentClass} {
    constructor(opt){
        super(opt)

${jsAttributes}

${gen.js}
    }
}`
        }
    }

    asComponent(){
        var gen = this.genChildren(this.opt.children, 0)

        var cssCode = this.genCSS(this.opt.class, this.opt.id, this.opt.attributes)

        var jsAttributes = this.genJS(this.opt.attributes, '')
        
        return {
            css: cssCode + '\n' + gen.css,
            js: `_c.add.${this.opt.class.replace('sk_ui_', '')}(_c => {
${jsAttributes}
${gen.js}
})`
        }
}

    genIndents(level = 0){
        var indentation = '    '
        var indentationsForThis = ''
        for (var i = 0; i < level + 1; i++) indentationsForThis += indentation
        return indentationsForThis
    }





    genCSS(_class, id, attributes){
        var res = []

        for (var name in attributes){
            var attr = attributes[name]
            if (name === 'pseudoClassName') continue
            if (attr.css) res.push(`    ${name}: ${attr.value};`)
        }

        var pseudoClass = attributes.pseudoClassName
        
        var targetSelector = (pseudoClass ? '.' + pseudoClass.value : '#' + id)

        if (res.length > 0){
            res = `/*  ${_class}  */
${targetSelector} {
${res.join('\n')}
}`
        }

        return  res
    }

    genJS(attributes, indents, parentIsThis){
        var res = []

        for (var name in attributes){
            var attr = attributes[name]

            if (name === 'pseudoClassName'){
                res.push(`${indents}    ${(parentIsThis ? 'this' : '_c')}.classAdd('${attr.value}')`)
                continue
            }

            if (!attr.css) res.push(`${indents}    ${(parentIsThis ? 'this' : '_c')}.${name} = '${attr.value}'`)
        }

        return res.join('\n')
    }

    genChild(child, level, parentIsThis){
        var indentationsForThis = this.genIndents(level)

        var rnd = Math.random().toString().split('.')
        if (rnd.length > 1) rnd = rnd [1]
        else rnd = '0.' + rnd[0]

        child.id += '_' + Date.now() + '_' + rnd
    
        for (var attrname in child.attributes) if (attrname === 'uuid') child.attributes[attrname].value = child.id

        var cssCode = this.genCSS(child.class, child.id, child.attributes)
        var jsAttributes = this.genJS(child.attributes, indentationsForThis)


        var childCode = this.genChildren(child.children, level+1)

        var jsCode = `
${indentationsForThis}${(parentIsThis ? 'this' : '_c')}.add.${child.class.replace('sk_ui_', '')}(_c => {
${jsAttributes}
    ${indentationsForThis}${childCode.js}
    ${indentationsForThis}
${indentationsForThis}})`

        return {
            css: cssCode + '\n' + childCode.css,
            js: jsCode
        }
    }

    genChildren(children, level = 0, parentIsThis, asCSS){
        var assembly = {
            css: [],
            js: []
        }
        
        for (var i in children){
            var child = children[i]
            
            var gen = this.genChild(child, level, parentIsThis, asCSS)
            assembly.css.push(gen.css)
            assembly.js.push(gen.js)
        }

        /*var indentationsForThis = this.genIndents(level)
        for (var i in assembly){
            assembly[i] = indentationsForThis + assembly[i]
        }*/

        return {
            css: assembly.css.join('\n'),
            js: assembly.js.join('\n')
        }
    }





    mapClassified(tree){
        var classified = []

        function traverse(node){
            for (var i = 0; i < node.children.length; i++){
                var child = node.children[i]

                traverse(child)

                if (child.pseudoClassName){
                    var component = child.component

                    delete child.component
                    classified.push(child)
                    var latest = classified[classified.length - 1]
                    latest.parentClass = latest.class
                    latest.class = latest.pseudoClassName
                    
                    node.children[i] = component.serialize(true)
                    node.children[i].class = node.children[i].pseudoClassName
                    node.children[i].attributes = []
                }

                delete child.component
            }
        }

        traverse(tree)

        return classified
    }
}


//for nodejs support
if ( (typeof process !== 'undefined') && (process.release.name === 'node') ){
    module.exports = SK_UI_Component_Bakery;
}