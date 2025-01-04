var path = require('path')
module.exports = class EJS_JUCE {
    constructor(){
        this.state = {
            data: {},
            listening: false,
            options: {},
        }
    }

    async init(){
        window.ejs = new (require(__dirname + '/ejs.js'))
        window.EJS_Template = require(__dirname + '/ejs_template.js')
        window.ejs_utils = new (require(__dirname + '/ejs_utils.js'))
    }


    /**
     * EjsElectron.data() -- Get/set the data (context) that will be passed to `ejs.render()`.
     * Overloads:
     *
     * - ejse.data('key') -- Retrieve the value of 'key' in the current data set.
     * - ejse.data('key', 'val') -- Set 'key' to 'val' in the current data set.
     * - ejse.data({key: 'val'}) -- Replace the current data set with a new one containing {key: 'val'}
     */
    data(key, val) {
        return this.updateState('data', 'ejse.data()', key, val)
    }


    /**
     * EjsElectron.listen() -- Start intercepting requests on the 'file:' protocol, looking for '.ejs' files.
     * It is not necessary to call this function up-front, as ejs-electron starts listening as soon as it's loaded.
     * Use this only to start listening again after calling EjsElectron.stopListening().
     */
    listen() {
        if (state.listening) return EjsElectron // already listening; nothing to do here
      
        protocol.handle('file', protocolListener)
        state.listening = true
        return EjsElectron // for chaining
    }


    /**
     * EjsElectron.options() -- Get/set the options that will be passed to `ejs.render()`.
     * Overloads:
     *   ejse.options('key') -- Retrieve the value of 'key' in the current options set.
     *   ejse.options('key', 'val') -- Set 'key' to 'val' in the current options set.
     *   ejse.options({key: 'val'}) -- Replace the current options set with a new one containing {key: 'val'}
     */
    options(key, val) {
        return this.updateState('options', 'ejse.options()', key, val)
    }
    
    
    // Helper Functions
    async compileEjs(pathname, contentBuffer) {
        this.state.data.ejse = this
        this.state.options.filename = pathname
    
        let contentString = contentBuffer.toString()
        let compiledEjs = await window.ejs.render(contentString, this.state.data, this.state.options)
    
        return compiledEjs
    }
    
    parsePathname(reqUrl) {
        let parsedUrl = new URL(reqUrl)
        let pathname = decodeURIComponent(parsedUrl.pathname)
    
        if (process.platform === 'win32' && !parsedUrl.host.trim()) {
        pathname = pathname.substring(1)
        }
    
        return pathname
    }
    
    async protocolListener(request){
        //try {
        let pathname = request.url//this.parsePathname(request.url)
            let fileContents = await fs.promises.readFile(request.url)
            let extension = path.extname(request.url)
            let mimeType = 'text/html'//mime.getType(extension)
        
            if (extension === '.ejs') {
                fileContents = await this.compileEjs(pathname, fileContents)
                mimeType = 'text/html'
            }
        
            return fileContents.toString()
            //return new Response(fileContents, {
            //    headers: { 'Content-Type': mimeType },
            //})
        /*} catch (exception) {
            console.error(exception)
        
            if (exception.code === 'ENOENT') {
                // HTTP Error 404 - Not Found
                return new Response(null, { status: 404, statusText: 'Not Found' })
            }
        
            // Internal error e.g. ejs compilation error
            return new Response(null, { status: 500 })
        }*/
    }
    
    updateState(field, context, key, val) {
        if (typeof key === 'string') {
        if (typeof val === 'undefined') return state[field][key]
    
        this.state[field][key] = val
    
        return EjsElectron // for chaining
        }
    
        if (Array.isArray(key) || typeof key !== 'object') {
        throw new TypeError(
            `EjsElectron Error - ${context} - Method accepts either a key and (optional) value or an object. Received ${typeof key}`
        )
        }
    
        this.state[field] = key
    
        return this // for chaining
    }
}




