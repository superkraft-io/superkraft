module.exports = class sk_ui {
    constructor(opt){
        this.opt = opt

        this.sk = opt.sk

        this.paths = opt.paths

        this.routes = {
            core: '',
            engine: '',
            shared : '',
            view   : '',
            global : ''
        }
        
        this.components = {
            core: []
        }



        this.endpoint = (opt.endpoint === 'wapp' ? new sk_ui_wapp(this) : new sk_ui_dapp(this))

        this.fontMngr = new (require(__dirname + '/sk_ui_fontMngr.js'))({sk: this.sk, parent: this})
        this.fontMngr.init()


        
    }

    async getDirectories(source, parent, depth = 0){
        if (!parent){
            parent = {
                name: '',
                children: []
            }
        }

        try {
            var dirs = await sk_fs.promises.readdir(source)
        } catch(err) {
            return parent
        }

        for (var i = 0; i < dirs.length; i++){
            var dir = dirs[i]
            var dirPath = source + dir + '/'

            try {
                var stat = undefined
                try {
                    stat = await sk_fs.promises.stat(dirPath)
                } catch(err) {
                    try {
                        stat = await sk_fs.promises.stat(dirPath.substr(0, dirPath.length - 1))
                    } catch(err) {
                        continue
                    }
                }
            } catch (err) {
                continue
            }
           
            if (stat.isDirectory()){
                var child = {
                    name: dir,
                    children: []
                }

                if (dir.indexOf('sk_ui_') > -1) parent.children.push(child)
                await this.getDirectories(dirPath, child, depth+1)
                
            }
        }

        return parent
    }

    async getComponentsFromPath(path, addFirstAndIgnore){
        var ui_files = await this.getDirectories(path)
        var ui_components = []
        
        var first = undefined

        for (var i = 0; i < ui_files.children.length; i++){
            var component = ui_files.children[i]
            var name = ui_files.children[i].name.split('.')[0].replace('sk_ui_', '')
            if (addFirstAndIgnore && name === addFirstAndIgnore){
                first = component
                continue
            }
            ui_components.push(component)
        }

        var concat = undefined
        if (first) concat = [...[first], ...ui_components]
        else concat = ui_components



        var simplified = []

        var iterateChildren = (children, parentPath = '')=>{
            for (var i = 0; i < children.length; i++){
                var child = children[i]
                if (!child){
                    var x = 0
                    continue
                }
                var _path = parentPath + child.name + '/'
                if (child.children) iterateChildren(child.children, _path)
                simplified.push({name: child.name.replace('sk_ui_', ''), path: _path})
            }
        }
        iterateChildren(concat)

        

        return simplified

        var ui_files = this.getDirectories(path)
        var ui_components = []
        
        if (addFirstAndIgnore) ui_components.push(addFirstAndIgnore)

        for (var i = 0; i < ui_files.children.length; i++){
            var component = ui_files.children[i].name.split('.')[0].replace('sk_ui_', '')
            if (addFirstAndIgnore && component === addFirstAndIgnore) continue
            ui_components.push(component)
        }

        return ui_components
    }

    async refresh(){
        this.components.core = await this.getComponentsFromPath(this.paths.frontend.core, 'component')
        if (this.sk.engine.ui) this.components.engine = await this.getComponentsFromPath(this.paths.frontend.engine, this.sk.engine.ui.root)
        else this.components.engine = []
        this.components.shared = await this.getComponentsFromPath(this.paths.frontend.shared)
        this.components.global = await this.getComponentsFromPath(this.paths.frontend.global)

        //this.optimize()
    }

    listCustom(path){
        
    }

    async renderInfo(viewUIComponentsPath){
        var results = {
            
            useCDN: (this.sk.cdn ? true : false),

            head: __dirname + '/head.ejs',
            script: __dirname + '/script.ejs',
            components: {
                core: this.components.core,
                engine: this.components.engine,
                shared: this.components.shared,
                view: await this.getComponentsFromPath(viewUIComponentsPath),
                global: this.components.global,
            },

            root: this.root,
        }

        if (this.paths.font) results.font = this.paths.font + 'sk_ui_font.ejs'

        return results
    }

    /*
    optimize(){
        var merged = {
            js: '',
            css: ''
        }

        var coreDirs = fs.readdirSync(this.paths.frontend.core)

        for (var i in coreDirs){
            var dirName = coreDirs[i]
            var fullPaths = {
                js: this.paths.frontend.core + dirName + '/' + dirName + '.js',
                css: this.paths.frontend.core + dirName + '/' + dirName + '.css'
            }
            try {
                merged.js += fs.readFileSync(fullPaths.js) + '\n\n'
                console.log('merged ' + dirName)
                merged.css += fs.readFileSync(fullPaths.css) + '\n\n'
            } catch(err) {
                var x = 0
            }
        }

        console.log(merged.js)
        console.log(merged.js.length)
    }
    */
        
}

class sk_ui_wapp {
    constructor(parent){
        parent.routes.core = '/sk_ui/'
        parent.routes.view = '/sk_ui_view/'
        parent.routes.global = '/sk_ui_global/'
        parent.routes.shared = '/sk_ui_shared/'
        setInterval(()=>{ parent.refresh() }, 5000)
    }
}

class sk_ui_dapp {
    constructor(parent){
        parent.routes.core = parent.paths.frontend.core
        parent.routes.engine = parent.paths.frontend.engine
        parent.routes.shared = parent.paths.frontend.shared
        parent.routes.global = parent.paths.frontend.global
    }
}