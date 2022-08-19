class sk_ui_table extends sk_ui_component {
    constructor(opt){
        super(opt)
        

        this.element.remove()

        this.bucket = JSOM.parse({
            root: parent.element,
            tree: {
                table_table: {}
            }
        })

        this.element = this.bucket.table
        this.style = this.element.style
        this.uuid = this.uuid

        this.styling = 'ttb'
    }

    newRow(cb){
        var _c = this.add.fromNew(sk_ui_tableRow)
        if (cb) cb(_c)
        return _c
    }

    /*onNewColumn(sender){
        var retCol = undefined
        
        for (var i = 0; i < this.children.length; i++){
            var _row = this.children[i]
            var _c = _row.add.fromNew(sk_ui_tableColumn)
            if (_row.uuid === sender.uuid) retCol = _c
        }

        return _c
    }*/
}

class sk_ui_tableRow extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.element.remove()
        
        var rowBucket = JSOM.parse({
            root: this.parent.element,
            tree: {tr_tr: {}}
        })

        this.element = rowBucket.tr
        this.style = this.element.style
        this.uuid = this.uuid

        this.styling = 'fullwidth'

        this.classAdd('sk_ui_tableRow')
    }

    newColumn(cb){
        //var _c = this.parent.onNewColumn(this)
        
        var _c = this.add.fromNew(sk_ui_tableColumn)
            
        if (cb) cb(_c)
        return _c
    }
}

class sk_ui_tableColumn extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.element.remove()

        var rowBucket = JSOM.parse({
            root: this.parent.element,
            tree: {td_td: {}}
        })

        this.element = rowBucket.td
        this.style = this.element.style
        this.uuid = this.uuid
    }
}