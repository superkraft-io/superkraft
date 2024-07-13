module.exports = class EJS_Template{
    constructor(){
        this.modes = {
            EVAL: 'eval',
            ESCAPED: 'escaped',
            RAW: 'raw',
            COMMENT: 'comment',
            LITERAL: 'literal'
        };
    }

    clearCache(){
        this.cache.reset();
    };

    init(text, opts) {
        opts = opts || ejs_utils.createNullProtoObjWherePossible();
        var options = ejs_utils.createNullProtoObjWherePossible();
        this.templateText = text;
        /** @type {string | null} */
        this.mode = null;
        this.truncate = false;
        this.currentLine = 1;
        this.source = '';
        options.client = opts.client || false;
        options.escapeFunction = opts.escape || opts.escapeFunction || ejs_utils.escapeXML;
        options.compileDebug = opts.compileDebug !== false;
        options.debug = !!opts.debug;
        options.filename = opts.filename;
        options.openDelimiter = opts.openDelimiter || this.openDelimiter || EJS_defs._DEFAULT_OPEN_DELIMITER;
        options.closeDelimiter = opts.closeDelimiter || this.closeDelimiter || EJS_defs._DEFAULT_CLOSE_DELIMITER;
        options.delimiter = opts.delimiter || this.delimiter || EJS_defs._DEFAULT_DELIMITER;
        options.strict = opts.strict || false;
        options.context = opts.context;
        options.cache = opts.cache || false;
        options.rmWhitespace = opts.rmWhitespace;
        options.root = opts.root;
        options.includer = opts.includer;
        options.outputFunctionName = opts.outputFunctionName;
        options.localsName = opts.localsName || this.localsName || EJS_defs._DEFAULT_LOCALS_NAME;
        options.views = opts.views;
        options.async = true//opts.async;
        options.destructuredLocals = opts.destructuredLocals;
        options.legacyInclude = typeof opts.legacyInclude != 'undefined' ? !!opts.legacyInclude : true;

        if (options.strict) {
            options._with = false;
        }
        else {
            options._with = typeof opts._with != 'undefined' ? opts._with : true;
        }

        this.opts = options;
        window.ejs_opts = this.opts

        this.regex = this.createRegex();
    }

    

    
    createRegex(){
        var str = EJS_defs._REGEX_STRING;
        var delim = ejs_utils.escapeRegExpChars(this.opts.delimiter);
        var open = ejs_utils.escapeRegExpChars(this.opts.openDelimiter);
        var close = ejs_utils.escapeRegExpChars(this.opts.closeDelimiter);
        str = str.replace(/%/g, delim)
        .replace(/</g, open)
        .replace(/>/g, close);
        return new RegExp(str);
    }

    async compile(){
        /** @type {string} */
        var src;
        /** @type {ClientFunction} */
        var fn;
        var opts = this.opts;
        var prepended = '';
        var appended = '';
        /** @type {EscapeCallback} */
        var escapeFn = opts.escapeFunction;
        /** @type {FunctionConstructor} */
        var ctor;
        /** @type {string} */
        var sanitizedFilename = opts.filename ? JSON.stringify(opts.filename) : 'undefined';

        if (!this.source) {
            this.generateSource();
            prepended +=
                '  var __output = "";\n' +
                '  function __append(s) { if (s !== undefined && s !== null) __output += s }\n';
            if (opts.outputFunctionName) {
                if (!EJS_defs._JS_IDENTIFIER.test(opts.outputFunctionName)) {
                throw new Error('outputFunctionName is not a valid JS identifier.');
                }
                prepended += '  var ' + opts.outputFunctionName + ' = __append;' + '\n';
            }
            if (opts.localsName && !EJS_defs._JS_IDENTIFIER.test(opts.localsName)) {
                throw new Error('localsName is not a valid JS identifier.');
            }
            if (opts.destructuredLocals && opts.destructuredLocals.length) {
                var destructuring = '  var __locals = (' + opts.localsName + ' || {}),\n';
                for (var i = 0; i < opts.destructuredLocals.length; i++) {
                var name = opts.destructuredLocals[i];
                if (!EJS_defs._JS_IDENTIFIER.test(name)) {
                    throw new Error('destructuredLocals[' + i + '] is not a valid JS identifier.');
                }
                if (i > 0) {
                    destructuring += ',\n  ';
                }
                destructuring += name + ' = __locals.' + name;
                }
                prepended += destructuring + ';\n';
            }
            if (opts._with !== false) {
                prepended +=  '  with (' + opts.localsName + ' || {}) {' + '\n';
                appended += '  }' + '\n';
            }
            appended += '  return __output;' + '\n';
            this.source = prepended + this.source + appended;
        }

        if (opts.compileDebug) {
            src = 'var __line = 1' + '\n'
                + '  , __lines = ' + JSON.stringify(this.templateText) + '\n'
                + '  , __filename = ' + sanitizedFilename + ';' + '\n'
                + 'try {' + '\n'
                + this.source
                + '} catch (e) {' + '\n'
                + '  rethrow(e, __lines, __filename, __line, escapeFn);' + '\n'
                + '}' + '\n';
        } else {
            src = this.source;
        }

        if (opts.client) {
            src = 'escapeFn = escapeFn || ' + escapeFn.toString() + ';' + '\n' + src;
            if (opts.compileDebug) {
                src = 'rethrow = rethrow || ' + rethrow.toString() + ';' + '\n' + src;
            }
        }

        if (opts.strict) {
            src = '"use strict";\n' + src;
        }
        if (opts.debug) {
            console.log(src);
        }
        if (opts.compileDebug && opts.filename) {
            src = src + '\n' + '//# sourceURL=' + sanitizedFilename + '\n';
        }

        try {
            if (opts.async) {
                // Have to use generated function for this, since in envs without support,
                // it breaks in parsing
                try {
                ctor = (new Function('return (async function(){}).constructor;'))();
                }
                catch(e) {
                if (e instanceof SyntaxError) {
                    throw new Error('This environment does not support async/await');
                }
                else {
                    throw e;
                }
                }
            }
            else {
                ctor = Function;
            }
            fn = new ctor(opts.localsName + ', escapeFn, include, rethrow', src);
        }
        catch(e) {
            // istanbul ignore else
            if (e instanceof SyntaxError) {
                if (opts.filename) {
                e.message += ' in ' + opts.filename;
                }
                e.message += ' while compiling ejs\n\n';
                e.message += 'If the above error is not helpful, you may want to try EJS-Lint:\n';
                e.message += 'https://github.com/RyanZim/EJS-Lint';
                if (!opts.async) {
                e.message += '\n';
                e.message += 'Or, if you meant to create an async function, pass `async: true` as an option.';
                }
            }
            throw e;
        }

        // Return a callable function which will execute the function
        // created by the source-code, with the passed data as locals
        // Adds a local `include` function which allows full recursive include
        var returnedFn = opts.client ? fn : async (data)=>{
            if (fn.name === 'head'){
                window.onBreak()
            }
            return fn.apply(opts.context, [data || ejs_utils.createNullProtoObjWherePossible(), escapeFn, ejs_utils.include, this.rethrow]);
        };
        if (opts.filename && typeof Object.defineProperty === 'function') {
        var filename = opts.filename;
        var basename = path.basename(filename, path.extname(filename));
        try {
            Object.defineProperty(returnedFn, 'name', {
            value: basename,
            writable: false,
            enumerable: false,
            configurable: true
            });
        } catch (e) {/* ignore */}
        }
        return returnedFn;
    }

    generateSource(){
        var opts = this.opts;

        if (opts.rmWhitespace) {
        // Have to use two separate replace here as `^` and `$` operators don't
        // work well with `\r` and empty lines don't work well with the `m` flag.
        this.templateText =
            this.templateText.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
        }

        // Slurp spaces and tabs before <%_ and after _%>
        this.templateText =
        this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');

        var self = this;
        var matches = this.parseTemplateText();
        var d = this.opts.delimiter;
        var o = this.opts.openDelimiter;
        var c = this.opts.closeDelimiter;

        if (matches && matches.length) {
        matches.forEach(function (line, index) {
            var closing;
            // If this is an opening tag, check for closing tags
            // FIXME: May end up with some false positives here
            // Better to store modes as k/v with openDelimiter + delimiter as key
            // Then this can simply check against the map
            if ( line.indexOf(o + d) === 0        // If it is a tag
            && line.indexOf(o + d + d) !== 0) { // and is not escaped
                closing = matches[index + 2];
                if (!(closing == d + c || closing == '-' + d + c || closing == '_' + d + c)) {
                    throw new Error('Could not find matching close tag for "' + line + '".');
                }
            }
            self.scanLine(line);
        });
        }

    }

    parseTemplateText(){
        var str = this.templateText;
        var pat = this.regex;
        var result = pat.exec(str);
        var arr = [];
        var firstPos;

        while (result) {
        firstPos = result.index;

        if (firstPos !== 0) {
            arr.push(str.substring(0, firstPos));
            str = str.slice(firstPos);
        }

        arr.push(result[0]);
        str = str.slice(result[0].length);
        result = pat.exec(str);
        }

        if (str) {
        arr.push(str);
        }

        return arr;
    }

    _addOutput(line){
        
        if (line.indexOf('.ui.head') > -1){
            var x = 0
        }

        if (this.truncate) {
            // Only replace single leading linebreak in the line after
            // -%> tag -- this is the single, trailing linebreak
            // after the tag that the truncation mode replaces
            // Handle Win / Unix / old Mac linebreaks -- do the \r\n
            // combo first in the regex-or
            line = line.replace(/^(?:\r\n|\r|\n)/, '');


            this.truncate = false;
        }
        if (!line) {
            return line;
        }

        // Preserve literal slashes
        line = line.replace(/\\/g, '\\\\');

        // Convert linebreaks
        line = line.replace(/\n/g, '\\n');
        line = line.replace(/\r/g, '\\r');

        // Escape double-quotes
        // - this will be the delimiter during execution
        line = line.replace(/"/g, '\\"');
        this.source += '    ; __append("' + line + '")' + '\n';
    }

    scanLine(line){
        var self = this;
        var d = this.opts.delimiter;
        var o = this.opts.openDelimiter;
        var c = this.opts.closeDelimiter;
        var newLineCount = 0;

        newLineCount = (line.split('\n').length - 1);

        switch (line) {
        case o + d:
        case o + d + '_':
            this.mode = this.modes.EVAL;
        break;
        case o + d + '=':
            this.mode = this.modes.ESCAPED;
        break;
        case o + d + '-':
            this.mode = this.modes.RAW;
        break;
        case o + d + '#':
            this.mode = this.modes.COMMENT;
        break;
        case o + d + d:
            this.mode = this.modes.LITERAL;
            this.source += '    ; __append("' + line.replace(o + d + d, o + d) + '")' + '\n';
        break;
        case d + d + c:
            this.mode = this.modes.LITERAL;
            this.source += '    ; __append("' + line.replace(d + d + c, d + c) + '")' + '\n';
        break;
        case d + c:
        case '-' + d + c:
        case '_' + d + c:
            if (this.mode == this.modes.LITERAL) {
                this._addOutput(line);
            }

        this.mode = null;
        this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
        break;
        default:
            // In script mode, depends on type of tag
            if (this.mode) {
                // If '//' is found without a line break, add a line break.
                switch (this.mode) {
                    case this.modes.EVAL:
                    case this.modes.ESCAPED:
                    case this.modes.RAW:
                        if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
                            line += '\n';
                        }
                }
                switch (this.mode) {
                    // Just executing code
                    case this.modes.EVAL: this.source += '    ; ' + line + '\n'; break; // Exec, esc, and output
                    case this.modes.ESCAPED: this.source += '    ; __append(escapeFn(' + this.stripSemi(line) + '))' + '\n'; break;
                    // Exec and output
                    case this.modes.RAW:
                        var includeStr = this.stripSemi(line)
                        if (line.indexOf('include(') > -1) includeStr = 'await ' + includeStr.replace(')', ', undefined, locals)' )
                        this.source += '    ; __append(' + includeStr + ')' + '\n';
                    break;
                    case this.modes.COMMENT: // Do nothing break;
                    // Literal <%% mode, append as raw output
                    case this.modes.LITERAL: this._addOutput(line); break;
                }
            }
            // In string mode, just add the output
            else {
                this._addOutput(line);
            }
        }

        if (self.opts.compileDebug && newLineCount) {
        this.currentLine += newLineCount;
        this.source += '    ; __line = ' + this.currentLine + '\n';
        }
    }


    stripSemi(str){
        return str.replace(/;(\s*$)/, '$1');
    }

    rethrow(err, str, flnm, lineno, esc) {
        var lines = str.split('\n');
        var start = Math.max(lineno - 3, 0);
        var end = Math.min(lines.length, lineno + 3);
        var filename = esc(flnm);
        // Error context
        var context = lines.slice(start, end).map(function (line, i){
            var curr = i + start + 1;
            return (curr == lineno ? ' >> ' : '    ')
            + curr
            + '| '
            + line;
        }).join('\n');

        // Alter exception message
        err.path = filename;
        err.message = (filename || 'ejs') + ':'
            + lineno + '\n'
            + context + '\n\n'
            + err.message;

        throw err;
    }
}