
var regExpChars = /[|\\{}()[\]^$+*?.]/g;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var hasOwn = function (obj, key) { return hasOwnProperty.apply(obj, [key]); };

var _ENCODE_HTML_RULES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&#34;',
    "'": '&#39;'
};
var _MATCH_HTML = /[&<>'"]/g;



var escapeFuncStr =
  'var _ENCODE_HTML_RULES = {\n'
+ '      "&": "&amp;"\n'
+ '    , "<": "&lt;"\n'
+ '    , ">": "&gt;"\n'
+ '    , \'"\': "&#34;"\n'
+ '    , "\'": "&#39;"\n'
+ '    }\n'
+ '  , _MATCH_HTML = /[&<>\'"]/g;\n'
+ 'function encode_char(c) {\n'
+ '  return _ENCODE_HTML_RULES[c] || c;\n'
+ '};\n';


module.exports =  class EJS_Utils {

    init(){

        this.cache = {
            _data: {},
            set: function (key, val) {
                this._data[key] = val;
            },
            get: function (key) {
                return this._data[key];
            },
            remove: function (key) {
                delete this._data[key];
            },
            reset: function () {
                this._data = {};
            }
        }


        try {
            if (typeof Object.defineProperty === 'function') {
            // If the Function prototype is frozen, the "toString" property is non-writable. This means that any objects which inherit this property
            // cannot have the property changed using an assignment. If using strict mode, attempting that will cause an error. If not using strict
            // mode, attempting that will be silently ignored.
            // However, we can still explicitly shadow the prototype's "toString" property by defining a new "toString" property on this object.
                Object.defineProperty(this.escapeXML, 'toString', { value: escapeXMLToString });
            } else {
                // If Object.defineProperty() doesn't exist, attempt to shadow this property using the assignment operator.
                this.escapeXML.toString = escapeXMLToString;
            }
        } catch (err) {
            console.warn('Unable to set escapeXML.toString (is the Function prototype frozen?)');
        }
    }

    escapeRegExpChars(string){
        // istanbul ignore if
        if (!string) {
            return '';
        }
        return String(string).replace(regExpChars, '\\$&');
    };



    encode_char(c){
        return _ENCODE_HTML_RULES[c] || c;
    }



    escapeXML(markup){
        return markup == undefined
            ? ''
            : String(markup)
            .replace(_MATCH_HTML, ejs_utils.encode_char());
    };

    escapeXMLToString(){
        return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr;
    }



    shallowCopy = function (to, from) {
        from = from || {};
        if ((to !== null) && (to !== undefined)) {
            for (var p in from) {
            if (!hasOwn(from, p)) {
                continue;
            }
            if (p === '__proto__' || p === 'constructor') {
                continue;
            }
            to[p] = from[p];
            }
        }
        return to;
    };

    shallowCopyFromList = function (to, from, list) {
        list = list || [];
        from = from || {};
        if ((to !== null) && (to !== undefined)) {
            for (var i = 0; i < list.length; i++) {
            var p = list[i];
            if (typeof from[p] != 'undefined') {
                if (!hasOwn(from, p)) {
                continue;
                }
                if (p === '__proto__' || p === 'constructor') {
                continue;
                }
                to[p] = from[p];
            }
            }
        }
        return to;
    };

    hyphenToCamel(str){
        return str.replace(/-[a-z]/g, function (match) { return match[1].toUpperCase(); });
    }

    createNullProtoObjWherePossible(){
        if (typeof Object.create == 'function') {
            return function () {
            return Object.create(null);
            };
        }
        if (!({__proto__: null} instanceof Object)) {
            return function () {
            return {__proto__: null};
            };
        }
        // Not possible, just pass through
        return function () {
            return {};
        };
    }

    async includeFile(path, options) {
        var opts = ejs_utils.shallowCopy(ejs_utils.createNullProtoObjWherePossible(), options);
        opts.filename = path //await ejs_utils.getIncludePath(path, opts);
        if (typeof options.includer === 'function') {
            var includerResult = options.includer(path, opts.filename);
            if (includerResult) {
            if (includerResult.filename) {
                opts.filename = includerResult.filename;
            }
            if (includerResult.template) {
                return await ejs.handleCache(opts, includerResult.template);
            }
            }
        }
        return await ejs.handleCache(opts);
    }

    async getIncludePath(path, options) {

        return path

        var includePath;
        var filePath;
        var views = options.views;
        var match = /^[A-Za-z]+:\\|^\//.exec(path);

        // Abs path
        if (match && match.length) {
            path = path.replace(/^\/*/, '');
            if (Array.isArray(options.root)) {
                includePath = await ejs_utils.resolvePaths(path, options.root);
            } else {
                includePath = ejs_utils.resolveInclude(path, options.root || '/', true);
            }
        }
        // Relative paths
        else {
            // Look relative to a passed filename first
            if (options.filename) {
                filePath = ejs_utils.resolveInclude(path, options.filename);
                try {
                    if (await fs.promises.access(filePath)) {
                        includePath = filePath;
                    }
                } catch(err) {
                    var x = 0   
                }
            }
            // Then look in any views directories
            if (!includePath && Array.isArray(views)) {
                includePath = ejs_utils.resolvePaths(path, views);
            }
            if (!includePath && typeof options.includer !== 'function') {
                throw new Error('Could not find the include file "' + options.escapeFunction(path) + '"');
            }
        }
        return includePath;
    }

    async resolvePaths(name, paths){
        var filePath;
        if (paths.some(async function (v) {
            filePath = ejs_utils.resolveInclude(name, v, true);
            return await fs.promises.access(filePath);
        })) {
            return filePath;
        }
    }

    resolveInclude(name, filename, isDir){
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

    async include(path, includeData, data){
        var d = ejs_utils.shallowCopy(ejs_utils.createNullProtoObjWherePossible(), data);
        if (includeData) {
            d = ejs_utils.shallowCopy(d, includeData);
        }

        var func = await ejs_utils.includeFile(path, window.ejs_opts)
        var res = await func(d);

        return res
};
}