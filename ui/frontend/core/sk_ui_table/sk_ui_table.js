class sk_ui_table extends sk_ui_component {
    constructor(opt){
        super(opt)


        this.header = this.add.fromClass(sk_ui_table_header)

        this.container = this.add.component(_c => {
            _c.styling += ' fullwidth fill'
            _c.compact = true
        })
    }

    update(){
        this.rows.update()
    }

    configure(obj){

        this.container.children.clear()
        
        for (var i in obj.rows){
            var row = obj.rows[i]
            this.container.add.fromClass(sk_ui_table_row, _c => {
                _c.add.fromClass(sk_ui_table_column)
            })
        }

        this.update()

        return this.rows
    }

    get rows(){
        //for (var i in this.container.)
    }
}

class sk_ui_table_header extends sk_ui_component {
    constructor(opt){
        super(opt)

    }

    get columns(){

    }
}

class sk_ui_table_row extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.columns = new sk_ui_table_columns()
    }

    addColumn(opt){
        this.parent.add.fromClass(sk_ui_table_row)
    }

    get columns(){ return this.container.children.children }
}


class sk_ui_table_column extends sk_ui_component {
    constructor(opt){
        super(opt)
    }
}