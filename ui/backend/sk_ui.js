var fs = require('fs')

module.exports = class sk_UI {
    constructor(opt){
        this.opt = opt

        this.paths = opt.paths

        this.routes = {
            core: '',
            shared: '',
            custom: ''
        }
        
        this.components = {
            core: []
        }

        this.refresh()

        this.endpoint = (opt.endpoint === 'wapp' ? new sk_UI_Web(this) : new sk_UI_Local(this))
    }

    getDirectories(source){
        return fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => (dirent.isDirectory() && dirent.name.indexOf('sk_ui_') > -1))
        .map(dirent => dirent.name)
    }

    getComponentsFromPath(path, addFirstAndIgnore){
        var ui_files = this.getDirectories(path)
        var ui_components = []
        
        if (addFirstAndIgnore) ui_components.push(addFirstAndIgnore)

        for (var i = 0; i < ui_files.length; i++){
            var component = ui_files[i].split('.')[0].replace('sk_ui_', '')
            if (addFirstAndIgnore && component === addFirstAndIgnore) continue
            ui_components.push(component)
        }

        return ui_components
    }

    refresh(){
        this.components.core = this.getComponentsFromPath(this.paths.frontend.core, 'component')
        this.components.shared = this.getComponentsFromPath(this.paths.frontend.shared)
    }

    listCustom(path){
        
    }

    renderInfo(customUIComponentsPath){
        return {
            head: __dirname + '/head.ejs',
            script: __dirname + '/script.ejs',
            components: {
                core: this.components.core,
                shared: this.components.shared,
                custom: this.getComponentsFromPath(customUIComponentsPath)
            },

            root: this.root
        }
    }
}

class sk_UI_Web {
    constructor(parent){
        parent.routes.core = '/sk_ui/'
        parent.routes.shared = '/sk_ui_shared/'
        setInterval(()=>{ parent.refresh() }, 5000)
    }
}

class sk_UI_Local {
    constructor(parent){
        parent.routes.core = parent.paths.frontend.core
        parent.routes.shared = parent.paths.frontend.shared
    }
}