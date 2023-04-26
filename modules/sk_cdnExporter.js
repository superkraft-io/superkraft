const fs = require('fs-extra')

module.exports = class SK_CDN_Exporter {
    constructor(opt){
        this.opt = opt
    }

    sk_minify(data){
        var lines_new = []
        var lines = data.split('\n')

        for (var i in lines){
            var line = lines[i].trim()
            if (line.length === 0) continue
            lines_new.push(line)
        }

        return lines_new.join('\n')
    }

    tryMinify(filePath){
        return new Promise(async resolve => {
            var split = filePath.toLowerCase().split('.')
            var ext = split[split.length - 1]

            
            try {
                var fileData = fs.readFileSync(filePath).toString()

                resolve(this.sk_minify(fileData))
            } catch(err) {
                return resolve('')
            }
            resolve('')
        })
    }

    consolidate(path, addFirstAndIgnore){
        return new Promise(async resolve => {
            var data = {
                js: '',
                css: ''
            }

            try { var dirs = fs.readdirSync(path) } catch(err) {
                return resolve(data)
            }

            

            if (addFirstAndIgnore){
                try { data.css += await this.tryMinify(path + addFirstAndIgnore + '/' + addFirstAndIgnore + '.css') } catch(err) {}
                try { data.js += await this.tryMinify(path + addFirstAndIgnore + '/' + addFirstAndIgnore + '.js') } catch(err) {}
            }

            for (var _d in dirs){
                var dir = dirs[_d]
                var dirPath = path + dir

                if (addFirstAndIgnore && dir === addFirstAndIgnore) continue

                if (fs.lstatSync(dirPath).isDirectory()){
                    if (dir.indexOf('sk_ui_') === -1) continue
                    var res = await this.consolidate(dirPath + '/')
                    
                    data.css += res.css || ''
                    data.js += res.js || ''
                } else {
                    try { data[(dirPath.indexOf('.css') > -1 ? 'css' : 'js')] += await this.tryMinify(dirPath) } catch(err) { }
                }
            }

            resolve(data)
        })
    }

    consolidateGeneral(){
        return new Promise(async resolve => {
            var data = {
                css: '',
                js: ''
            }

            for (var _p in global.sk.paths.sk_ui.frontend){
                var path = global.sk.paths.sk_ui.frontend[_p]
    
                var cRes = await this.consolidate(path, (_p === 'core' ? 'sk_ui_component' : undefined))

                data.css += cRes.css
                data.js += cRes.js
            }

            resolve(data)
        })
    }




    consolidateView(viewPath){
        return new Promise(async resolve => {
            var cRes = await this.consolidate(viewPath + 'frontend/sk_ui/')
            resolve(cRes)
        })
    }


    consolidateViews(){
        return new Promise(async resolve => {
            for (var _v in global.sk.views){
                var view = global.sk.views[_v]
                var cRes = await this.consolidateView(global.sk.paths.views + view.id + '/')

                var viewPath = global.sk.cdn.servePath + '/views/' + view.id + '/'
                fs.copySync(global.sk.paths.views + view.id + '/frontend', viewPath)
                fs.removeSync(viewPath + 'sk_ui')
                

                if (cRes.css.length > 0) fs.writeFileSync(viewPath + view.id + '.css', cRes.css)
                if (cRes.js.length > 0) fs.writeFileSync(viewPath + view.id + '.js', cRes.js)
            }

            resolve()
        })
    }

    consolidateUI(){
        return new Promise(async resolve => {
            var data = {
                css: '',
                js: ''
            }

            var appendData = _data => {
                data.css += _data.css
                data.js += _data.js
            }
            
    
            appendData(await this.consolidateGeneral())
            await this.consolidateViews()
            

            resolve(data)
        })
    }
    

    export(){
        return new Promise(async resolve => {
            fs.removeSync(global.sk.cdn.servePath)
            fs.mkdirSync(global.sk.cdn.servePath)
            fs.mkdirSync(global.sk.cdn.servePath + '/views/')

            var data = await this.consolidateUI()

            fs.writeFileSync(global.sk.cdn.servePath + '/sk_ui.css', data.css)
            fs.writeFileSync(global.sk.cdn.servePath + '/sk_ui.js', data.js)

            fs.copySync(global.sk.paths.superkraft + '/frontend/', global.sk.cdn.servePath + '/sk_frontend/')

            fs.copySync(global.sk.paths.app_frontend, global.sk.cdn.servePath + '/app_frontend/')
            fs.removeSync(global.sk.cdn.servePath + '/app_frontend/sk_ui/')
            
            resolve()
        })
    }
}