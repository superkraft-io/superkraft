var SK_Module_Scope = (module, __dirname, window) => { return (() => { /*...*/ })() }

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

        func.call(null, this, path, window)
    }

    loadFromURL(path) {
        var data = sk_juce_api.fetch(path)

        var trimmedPath = path.replace('https://juce.backend', '').split(':')[0].split('/')
        trimmedPath.splice(trimmedPath.length - 1, 1)
        trimmedPath = trimmedPath.join('/')
        this.loadFromData(data, trimmedPath)

        SK_Module.cache[path] = this.exports
    }

    getNativeModulePath(path) {
        var split = path.split(':')

        if (split[0].toLowerCase() !== 'sk') return

        var moduleName = split[1].toLowerCase()

        if (!moduleName || moduleName.trim().length == 0) return

        var modulePath = sk_juce_api.nativeModules[moduleName]

        return modulePath
    }


    /***********************/


    static require(path) {
        var _this = arguments
        var str = sk_juce_api.path.reformatPath(path)


        var module = new SK_Module()

        var nativeModulePath = module.getNativeModulePath(path)

        var modulePath = nativeModulePath || path

        if (SK_Module.cache[modulePath]) return this.cache[modulePath]

        
        module.loadFromURL(modulePath)

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