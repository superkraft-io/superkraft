class sk_shortcuts {
    constructor(opt){
        this.list = {}
    }

    tryExecute(_e){
        document.querySelectorAll('.sk_ui_contextMenu_Item').forEach(_c => {
            _c.sk_ui_obj.close()
        })
    }
}