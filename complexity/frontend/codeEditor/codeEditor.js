class ss_ui_complexity_codeEditor extends ss_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)

        this.classAdd('ss_ui_complexity_codeEditor')

        this.disableComplexity(true, true)
        
        this.styling += 'ttb'


        this.add.component(_c => {
            _c.padding = 8

            this.bakeOutputBtn = _c.add.button(_c => {
                _c.icon = 'bread slice'
                _c.type = 'icon'
                _c.toggle = true

                _c.hint('Show bake output (CTRL + SHIFT + B)')

                _c.onToggled = val =>{
                    this.cssEditorGlobal.hide()
                    this.bakeOutput.hide()

                    if (val) this.bakeOutput.show()
                    else this.cssEditorGlobal.show()
                }
            })

            this.bakeOutputBtn = _c.add.button(_c => {
                _c.icon = 'css3'
                _c.type = 'icon'
                _c.toggle = true

                _c.hint('Separate CSS baking (CTRL + SHIFT + C)')

                _c.onToggled = val =>{
                    this.cssEditorGlobal.hide()
                    this.bakeOutput.hide()

                    if (val) this.bakeOutput.show()
                    else this.cssEditorGlobal.show()
                }
            })

            _c.add.spacer()

            _c.add.button(_c => {
                _c.icon = 'sitemap'
                _c.text = 'Bake Classified'

                _c.label.moveBefore(_c._icon)
                _c._icon.style.marginRight = '0px'
                _c._icon.style.marginLeft = '16px'

                _c.hint('Bake all classified objects into separate UI components (CTRL + B)')

                _c.onClick = ()=>{
                    this.bake()
                }
            })
        })




        /************/
        

        this.cssEditorGlobal = this.add.component(_c => {
            _c.styling += ' fill'
            _c.textareaBucket = JSOM.parse({root: _c.element, tree: {textarea_textarea: {}}})

            
            var globalStyle = undefined

            this.cssEditorGlobal_CodeMirror = CodeMirror.fromTextArea(_c.textareaBucket.textarea, {
                lineNumbers: true,
                theme: 'vscode-dark',
                mode:  'javascript',
                indentUnit: 4
            })
            this.cssEditorGlobal_CodeMirror.on('change', ()=>{
                console.log('Global CSS Changed')
                if (globalStyle) globalStyle.remove()
                globalStyle = document.createElement('style')
                globalStyle.innerHTML = this.cssEditorGlobal_CodeMirror.getValue()
                document.getElementsByTagName('head')[0].appendChild(globalStyle);
            })
        })


        /************/


        this.bakeOutput = this.add.component(_c => {
            _c.styling = ' ttb fullwidth fill'

            _c.hide()
            
            _c.add.component(_c => {
                _c.style.height = '50%'
                _c.textareaBucket = JSOM.parse({root: _c.element, tree: {textarea_textarea: {}}})

                
                this.cssEditor = CodeMirror.fromTextArea(_c.textareaBucket.textarea, {
                    lineNumbers: true,
                    theme: 'vscode-dark',
                    mode:  'javascript',
                    indentUnit: 4
                })
            })

            _c.add.component(_c => {
                _c.style.height = '50%'
                _c.textareaBucket = JSOM.parse({root: _c.element, tree: {textarea_textarea: {}}})

                this.jsEditor = CodeMirror.fromTextArea(_c.textareaBucket.textarea, {
                    lineNumbers: true,
                    theme: 'vscode-dark',
                    mode:  'javascript',
                    indentUnit: 4
                })
            })

            

            this.multiObjectWarning = this.add.component(_c => {
                _c.style.position = 'absolute'
                _c.style.left = '0px'
                _c.style.top = '0px'
                _c.style.right = '0px'
                _c.style.bottom = '0px'
                
                _c.style.padding = '64px'

                _c.frosted = true

                _c.hide()

                _c.add.label(_c => {
                    _c.text = 'Multiple objects selected.\nCode can only be generated for single object selection.'
                })
            })
        })
    }

    

    from(object){
        clearTimeout(this.bakeTimer)

        this.bakeTimer = setTimeout(()=>{
            var source_code = new SS_UI_Component_Bakery(object.serialize()).asComponent()
            this.cssEditor.setValue(source_code.css)
            this.jsEditor.setValue(source_code.js)
        }, 10)
    }

    bake(){
        var view = sk.app.body.view
        var serialization = view.serialize(false, true)

        var bakery = new SS_UI_Component_Bakery()
        var bakeRes = bakery.mapClassified(serialization)

        if (bakeRes.length === 0) return sk.toast.warning('No objects have been classified yet. Please flag at least one object for classification.')

        sk.complexity.actions.bake(bakeRes).then(res => {
            if (res.length === 0){
                sk.toast.success('Baked successfully!')
                return console.log('[BAKING] Successful!')
            }

            s.toast.error('Baking failed! Check dev console for more info.')
            console.error('[BAKING] ' + res.length + ' error' + (res.length > 1 ? 's' : ''))
            console.error(res)
        })
    }



}
