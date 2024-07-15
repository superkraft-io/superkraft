var SK_Module_Scope = (module, __dirname, window)=>{ return (()=>{ /*...*/ })() }

class SK_Module {
    static cache = {}
    constructor() {
        
    }

    fetch(path) {
        /*
        
            maybe need to format path to handle certain scenarios such as:

            ./targetFile.js
            ./ targetFile       without extension
            ../                 walk up the path - !!! IMPORTANT !!! walking up a path may not exceed the root of the "assets" folder
            \                   non-unix path delimiters
        
        */
        const request = new XMLHttpRequest()
        request.open('GET', path, false)
        try { request.send() } catch (err) {
            console.error(err)
            throw 'Could not fetch module at ' + path
        }

        var response = undefined

        try { response = request.responseText } catch { response = request.response }

        return response
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

    loadFromURL(path){
        var data = this.fetch(path)

        var trimmedPath = path.replace('https://juce.backend', '').split(':')[0].split('/')
        trimmedPath.splice(trimmedPath.length - 1, 1)
        trimmedPath = trimmedPath.join('/')
        this.loadFromData(data, trimmedPath)

        SK_Module.cache[path] = this.exports
    }

    static require(path){
        if (SK_Module.cache[path]) return this.cache[path]

        var module = new SK_Module()
        module.loadFromURL(path)

        return module.exports
    }

    static requireAsync(path){
        return new Promise((resolve, reject) => {

        })
    }
}

SK_Module.cache = {}

sk_c_api.sk_module = SK_Module

window.require = sk_c_api.sk_module.require
window.requireAsync = sk_c_api.sk_module.requireAsync


export default SK_Module