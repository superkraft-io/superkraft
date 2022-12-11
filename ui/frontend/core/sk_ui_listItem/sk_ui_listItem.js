class sk_ui_listItem extends sk_ui_button {
    constructor(parent, opt){
        super(parent)

        this.styling = 'left middle'

        this.list = this.parent.parent



        this.onClick = ()=>{
            if (this.list.__highlightOnSelect) this.select(false, true)
            if (this.list.onItemClicked && !this.labelEditor.editing) this.list.onItemClicked(this)
        }
        this.onMouseEnter = ()=>{ if (this.list.onItemMouseEnter && !this.labelEditor.editing) this.list.onItemMouseEnter(this) }
        this.onMouseLeave = ()=>{ if (this.list.onItemMouseLeave && !this.labelEditor.editing) this.list.onItemMouseLeave(this) }

        this.onDoubleClick = ()=>{
            if (!this.editable && !this.labelEditor.editing) return
            this.labelEditor.editing = true
            this.element.classList.add('editing')
            this.labelEditor.transition('fade in', 50)
            this.labelEditor.value = this.label.text
            if (this.list.onItemDoubleClick) this.list.onItemDoubleClick(this)

            var completeEditing = ()=>{
                this.labelEditor.transition('fade out', 50)
                this.labelEditor.editing = false
                this.labelEditor.onkeyup = undefined
                this.element.classList.remove('editing')
                document.removeEventListener('click', onGlobalClick)
            }
            this.labelEditor.onkeyup = _e => {
                if (_e.which === 27 || _e.which === 13){
                    if (_e.which === 13) this.label.text = this.labelEditor.value
                    completeEditing()
                }
            }

            var onGlobalClick = _e => {
                if (_e.path[0].editing) return
                completeEditing()
            }
            document.addEventListener('click', onGlobalClick)
        }
        

        this.add.component(_c => {
            _c.styling = 'fill'
        })
        
        //setup label editor
        this.labelEditor = JSOM.parse({root: this.label.element, tree: {
            input_labelEditor: { class: 'sk_ui_listItem_labelEditor', spellcheck: 'false' }
        }}).labelEditor




        this.classAdd('_hidden_height')
        this.classAdd('_hidden_visibility')
        setTimeout(()=>{
            this.classRemove('_hidden_height')
        setTimeout(()=>{
            this.classRemove('_hidden_visibility')
            this.classAdd('sk_ui_listItem_created')
        }, 100)
        }, 10)
    }

    select(){
        this.list.deselectAll()
        this.classAdd('selected')
    }
}