var SK_Module_Scope = (module, require, __dirname, window) => { return (() => { /*...*/ })() }

class SK_Module {
    static cache = {}
    constructor() {
        
    }

    loadFromData(data, path) {
        const wrappedData = `return ${SK_Module_Scope.toString().replace('/*...*/', data)}`

        try {
            var func = new Function(wrappedData)
        } catch (err) {
            throw err
        }
        func = func()

        func.call(null, this, this.__sk_module_require, path, window)
    }

    loadFromURL(path) {
        var data = sk_juce_api.fetch(path)

        var trimmedPath = path.replace('https://juce.backend', '').split(':')[0].split('/')
        trimmedPath.splice(trimmedPath.length - 1, 1)
        trimmedPath = trimmedPath.join('/')
        this.loadFromData(data, trimmedPath)

        SK_Module.cache[path] = this.exports
    }

    static getNativeModulePath(path) {
        var split = path.split(':')

        if (split[0].toLowerCase() !== 'sk') return

        var moduleName = split[1].toLowerCase()

        if (!moduleName || moduleName.trim().length == 0) return

        var modulePath = sk_juce_api.nativeModules[moduleName]

        return modulePath
    }


    /***********************/

    static getAbsolutePath(_path, parentModule) {
        var path = sk_juce_api.path.unixify(_path)

        if (path.substr(0, 2) == './') {
            if (parentModule) {
                path = sk_juce_api.path.dirname(parentModule.__sk_module_source_path) + path.substr(1, path.length)
            } else {
                //I'm not entirely sure how to format the path if there is no parent module.
                //What root path do we use? the assets folder? The SK root folder?
                //I'll have to think about this one.
                //Also, important to know, if there is no parent module, it most likely means that the require()
                //function was called from sk_vb.js, which is a reserved root file.

                return _path
            }
        }

        if (path.substr(0, 3) != '../') return path


        var split = (sk_juce_api.path.dirname(parentModule.__sk_module_source_path) + '/' + path).split('/')


        var arr = []
        for (var i = 0; i < split.length; i++) {
            var part = split[i]

            if (part == '..') {
                arr.splice(arr.length - 1, 1)
            } else {
                arr.push(part)
            }
        }

        var newPath = arr.join('/')

        return newPath
    }


    static require(path, parentModule) {
        


        var module = new SK_Module()
        module.__sk_module_parent = parentModule
        module.__sk_module_require = path => {
            var _this = arguments
            var str = sk_juce_api.path.dirname(path, module)
            return require(path, module)
        }


        module.__sk_module_source_path = SK_Module.getNativeModulePath(path) || SK_Module.getAbsolutePath(path, parentModule)

        if (SK_Module.cache[module.__sk_module_source_path]) return this.cache[module.__sk_module_source_path]

        
        module.loadFromURL(module.__sk_module_source_path)

        return module.exports
    }

    static requireAsync(path){
        return new Promise((resolve, reject) => {

        })
    }


    
}

SK_Module.cache = {}

sk_juce_api.sk_module = SK_Module

window.require = sk_juce_api.sk_module.require
window.requireAsync = sk_juce_api.sk_module.requireAsync


export default SK_Module