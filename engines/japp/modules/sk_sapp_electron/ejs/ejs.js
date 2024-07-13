window.EJS_defs = {
    scopeOptionWarned: false,
    /** @type {string} */
    //var _VERSION_STRING = require('../package.json').version;
    _DEFAULT_OPEN_DELIMITER: '<',
    _DEFAULT_CLOSE_DELIMITER: '>',
    _DEFAULT_DELIMITER: '%',
    _DEFAULT_LOCALS_NAME: 'locals',
    _NAME: 'ejs',
    _REGEX_STRING: '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)',
    _OPTS_PASSABLE_WITH_DATA: ['delimiter', 'scope', 'context', 'debug', 'compileDebug',
    'client', '_with', 'rmWhitespace', 'strict', 'filename', 'async'],
    
    
    _BOM: /^\uFEFF/,
    _JS_IDENTIFIER: /^[a-zA-Z_$][0-9a-zA-Z_$]*$/,
}

// We don't allow 'cache' option to be passed in the data obj for
// the normal `render` call, but this is where Express 2 & 3 put it
// so we make an exception for `renderFile`
EJS_defs._OPTS_PASSABLE_WITH_DATA_EXPRESS = EJS_defs._OPTS_PASSABLE_WITH_DATA.concat('cache')



var fileLoader = fs.promises.readFile;

module.exports = class EJS {
    constructor(){

    }

    async init(){
        var path = await require('/path');
        var utils = await require('/utils');

        this.cache = EJS_Utils.cache;
        this.localsName = EJS_defs._DEFAULT_LOCALS_NAME;
        this.promiseImpl = (new Function('return this;'))().Promise;
        this.resolveInclude = function(name, filename, isDir) {
            var dirname = path.dirname;
            var extname = path.extname;
            var resolve = path.resolve;
            var includePath = resolve(isDir ? filename : dirname(filename), name);
            var ext = extname(name);
            if (!ext) {
                includePath += '.ejs';
            }
            return includePath;
        };
    }

    async resolvePaths(name, paths){
        var filePath;
        if (paths.some(async function (v) {
            filePath = this.resolveInclude(name, v, true);
            return await fs.promises.access(filePath);
        })) {
            return filePath;
        }
      }
      



    async getIncludePath(path, options) {
        var includePath;
        var filePath;
        var views = options.views;
        var match = /^[A-Za-z]+:\\|^\//.exec(path);

        // Abs path
        if (match && match.length) {
            path = path.replace(/^\/*/, '');
            if (Array.isArray(options.root)) {
            includePath = await resolvePaths(path, options.root);
            } else {
            includePath = exports.resolveInclude(path, options.root || '/', true);
            }
        }
        // Relative paths
        else {
            // Look relative to a passed filename first
            if (options.filename) {
            filePath = exports.resolveInclude(path, options.filename);
            if (await fs.promises.access(filePath)) {
                includePath = filePath;
            }
            }
            // Then look in any views directories
            if (!includePath && Array.isArray(views)) {
            includePath = resolvePaths(path, views);
            }
            if (!includePath && typeof options.includer !== 'function') {
            throw new Error('Could not find the include file "' +
                options.escapeFunction(path) + '"');
            }
        }
        return includePath;
    }

    /**
     * Get the template from a string or a file, either compiled on-the-fly or
     * read from cache (if enabled), and cache the template if needed.
     *
     * If `template` is not set, the file specified in `options.filename` will be
     * read.
     *
     * If `options.cache` is true, this function reads the file from
     * `options.filename` so it must be set prior to calling this function.
     *
     * @memberof module:ejs-internal
     * @param {Options} options   compilation options
     * @param {String} [template] template source
     * @return {(TemplateFunction|ClientFunction)}
     * Depending on the value of `options.client`, either type might be returned.
     * @static
     */

    async handleCache(options, template) {
        var func;
        var filename = options.filename;
        var hasTemplate = arguments.length > 1;

        if (options.cache) {
            if (!filename) {
                throw new Error('cache option requires a filename');
            }
            func = this.cache.get(filename);
            if (func) {
                return func;
            }
            if (!hasTemplate) {
                template = (await fileLoader(filename)).toString().replace(EJS_defs._BOM, '');
            }
        }
        else if (!hasTemplate) {
            // istanbul ignore if: should not happen at all
            if (!filename) {
            throw new Error('Internal EJS error: no file name or template '
                            + 'provided');
            }
            template = (await fileLoader(filename)).toString().replace(EJS_defs._BOM, '');
        }
        func = await this.compile(template, options);
        if (options.cache) {
            this.cache.set(filename, func);
        }
        return func;
    }


    async tryHandleCache(options, data, cb){
        var result;
        if (!cb) {
            if (typeof exports.promiseImpl == 'function') {
                return new exports.promiseImpl(async function (resolve, reject) {
                    try {
                        result = await this.handleCache(options)(data);
                        resolve(result);
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            }
            else {
                throw new Error('Please provide a callback function');
            }
        }
        else {
            try {
                result = await this.handleCache(options)(data);
            }
            catch (err) {
                return cb(err);
            }

            cb(null, result);
        }
    }


    fileLoader(filePath){
        return fileLoader(filePath);
    }

    async includeFile(path, options) {
        var opts = EJS_Utils.shallowCopy(EJS_Utils.createNullProtoObjWherePossible(), options);
        opts.filename = await getIncludePath(path, opts);
        if (typeof options.includer === 'function') {
            var includerResult = options.includer(path, opts.filename);
            if (includerResult) {
            if (includerResult.filename) {
                opts.filename = includerResult.filename;
            }
            if (includerResult.template) {
                return await handleCache(opts, includerResult.template);
            }
            }
        }
        return await handleCache(opts);
    }

    

    

    async compile(template, opts) {
        var templ;

        // v1 compat
        // 'scope' is 'context'
        // FIXME: Remove this in a future version
        if (opts && opts.scope) {
            if (!EJS_defs.scopeOptionWarned){
            console.warn('`scope` option is deprecated and will be removed in EJS 3');
            EJS_defs.scopeOptionWarned = true;
            }
            if (!opts.context) {
            opts.context = opts.scope;
            }
            delete opts.scope;
        }
        templ = new EJS_Template()
        templ.init(template, opts)
        return await templ.compile();
    };

    /**
     * Render the given `template` of ejs.
     *
     * If you would like to include options but not data, you need to explicitly
     * call this function with `data` being an empty object or `null`.
     *
     * @param {String}   template EJS template
     * @param {Object}  [data={}] template data
     * @param {Options} [opts={}] compilation and rendering options
     * @return {(String|Promise<String>)}
     * Return value type depends on `opts.async`.
     * @public
     */

    async render (template, d, o) {
        var data = d || EJS_Utils.createNullProtoObjWherePossible();
        var opts = o || EJS_Utils.createNullProtoObjWherePossible();

        // No options object -- if there are optiony names
        // in the data, copy them to options
        if (arguments.length == 2) {
            EJS_Utils.shallowCopyFromList(opts, data, EJS_defs._OPTS_PASSABLE_WITH_DATA);
        }

        var func = await this.handleCache(opts, template)

        return await func(data);
    };

    /**
     * Render an EJS file at the given `path` and callback `cb(err, str)`.
     *
     * If you would like to include options but not data, you need to explicitly
     * call this function with `data` being an empty object or `null`.
     *
     * @param {String}             path     path to the EJS file
     * @param {Object}            [data={}] template data
     * @param {Options}           [opts={}] compilation and rendering options
     * @param {RenderFileCallback} cb callback
     * @public
     */

    renderFile() {
        var args = Array.prototype.slice.call(arguments);
        var filename = args.shift();
        var cb;
        var opts = {filename: filename};
        var data;
        var viewOpts;

        // Do we have a callback?
        if (typeof arguments[arguments.length - 1] == 'function') {
            cb = args.pop();
        }
        // Do we have data/opts?
        if (args.length) {
            // Should always have data obj
            data = args.shift();
            // Normal passed opts (data obj + opts obj)
            if (args.length) {
            // Use shallowCopy so we don't pollute passed in opts obj with new vals
            EJS_Utils.shallowCopy(opts, args.pop());
            }
            // Special casing for Express (settings + opts-in-data)
            else {
            // Express 3 and 4
            if (data.settings) {
                // Pull a few things from known locations
                if (data.settings.views) {
                opts.views = data.settings.views;
                }
                if (data.settings['view cache']) {
                opts.cache = true;
                }
                // Undocumented after Express 2, but still usable, esp. for
                // items that are unsafe to be passed along with data, like `root`
                viewOpts = data.settings['view options'];
                if (viewOpts) {
                EJS_Utils.shallowCopy(opts, viewOpts);
                }
            }
            // Express 2 and lower, values set in app.locals, or people who just
            // want to pass options in their data. NOTE: These values will override
            // anything previously set in settings  or settings['view options']
            EJS_Utils.shallowCopyFromList(opts, data, EJS_defs._OPTS_PASSABLE_WITH_DATA_EXPRESS);
            }
            opts.filename = filename;
        }
        else {
            data = EJS_Utils.createNullProtoObjWherePossible();
        }

        return tryHandleCache(opts, data, cb);
    };
}