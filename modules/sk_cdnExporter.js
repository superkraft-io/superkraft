const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Builds the folder a wapp loads from the CDN when cdn.targets.site is 'public' (cdn.servePath):
//
//   sk_ui.js, sk_ui.css      every core, engine and shared sk_ui component, in the order pages load them
//   views/<id>/              the view's frontend; <id>.js and <id>.css hold its sk_ui components, then the global ones
//   sk_frontend/             superkraft/frontend
//   app_frontend/            the app's frontend
//   app_global/              the global frontend (fonts and other files the global components use)
//
// sk_ui folders stay in the copies: components find their own files (images, workers) through root_url.
// Source-only files are left out (node_modules, TypeScript, package and tsconfig files, source maps), and so
// is anything marked `.requires_<feature>` (gated code never goes to the public CDN) or `.ignore_on_<type>`.
//
// cdn.minify: true minifies every .js and .css (bundles and copied files; *.min.* are left as they are), or
// {js: true, css: false} picks. terser and clean-css do it, keeping function and class names (components are
// looked up by them) and leaving top-level names alone. A file that can't be minified goes out as it is.
//
// Files that haven't changed are left alone, with their times, so exporting again is quick and Deployments
// uploads only what changed. <out>.export.json remembers the minify setting and what each bundle was built
// from: changing the setting rewrites everything once, an unchanged bundle isn't minified again. Files that are gone from the sources are removed. Nothing is uploaded here:
// Aurora's Deployments publishes the folder.

const SKIP_DIRS = new Set(['node_modules', '.git', '.vscode', '.idea'])
// Server templates (.ejs) and repository files never go out; neither do notes (.md)
const SKIP_FILES = /^(package(-lock)?\.json|tsconfig[^/]*\.json|\.ds_store|thumbs\.db|\.git|\.gitignore|\.gitmodules|\.gitattributes|\.gitkeep|\.npmignore)$/i
const SKIP_EXT = /\.(ts|tsx|map|ejs|md)$/i

module.exports = class SK_CDN_Exporter {
    constructor(opt){
        this.sk = opt.sk
        this.opt = opt
        this.stats = {copied: 0, kept: 0, removed: 0, bytes: 0, minified: 0, unminified: []}
        var m = (opt.sk.cdn || {}).minify
        this.minify = m === true ? {js: true, css: true} : {js: !!(m && m.js), css: !!(m && m.css)}
    }

    /* ---------------- minifying ---------------- */

    get manifestPath(){ return this.out + '.export.json' }

    loadManifest(){
        var prev = null
        try { prev = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8')) } catch(err) {}
        var same = !!prev && JSON.stringify(prev.minify) === JSON.stringify(this.minify)
        // A different setting: every file is written again
        this.rewriteAll = !same
        this.manifest = {minify: this.minify, bundles: same ? (prev.bundles || {}) : {}}
    }

    saveManifest(){
        fs.writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2))
    }

    minifies(name){
        if (/\.min\.(js|mjs|css)$/i.test(name)) return false
        if (/\.(js|mjs|cjs)$/i.test(name)) return this.minify.js
        if (/\.css$/i.test(name)) return this.minify.css
        return false
    }

    tool(name){
        try { return require(name) } catch(err) {
            try { return require(require.resolve(name, {paths: [process.cwd()]})) } catch(err2) {
                throw new Error(name + ' is not installed (npm i -D ' + name + ')')
            }
        }
    }

    /** Minified code, or the code as it is when it can't be minified (what failed is listed at the end) */
    async minified(code, name){
        try {
            if (/\.css$/i.test(name)) {
                var CleanCSS = this.tool('clean-css')
                var res = new CleanCSS({level: 1, rebase: false, inline: false}).minify(code)
                if (res.errors && res.errors.length) throw new Error(res.errors[0])
                this.stats.minified++
                return res.styles
            }
            var terser = this.tool('terser')
            var isModule = /\.mjs$/i.test(name) || /^\s*(import|export)\b/m.test(code)
            var out = await terser.minify(code, {
                module: isModule, keep_classnames: true, keep_fnames: true,
                compress: {passes: 1}, mangle: true, format: {comments: false}
            })
            this.stats.minified++
            return out.code
        } catch(err) {
            this.stats.unminified.push(name + ': ' + ((err && err.message) || err))
            return code
        }
    }

    get out(){
        var cdn = this.sk.cdn || {}
        var dir = cdn.servePath || ((cdn.paths && cdn.paths.local) ? cdn.paths.local + 'site' : null)
        if (!dir) throw new Error('[SK CDN] Set cdn.servePath (the folder to export to) in the config')
        return dir.replace(/[\\/]+$/, '')
    }

    /* ---------------- copying ---------------- */

    skipped(name, full, isDir){
        if (isDir) {
            if (SKIP_DIRS.has(name)) return true
            if (this.sk.gate && this.sk.gate.featureOfDirSync(full + '/')) return true
            if (this.sk.appTypeFilter && this.sk.appTypeFilter.isDirIgnoredSync(full + '/')) return true
            return false
        }
        if (SKIP_FILES.test(name)) return true
        if (SKIP_EXT.test(name)) return true
        if (this.sk.gate && this.sk.gate.isMarkerFileName && this.sk.gate.isMarkerFileName(name)) return true
        if (this.sk.appTypeFilter && this.sk.appTypeFilter.isMarkerFileName && this.sk.appTypeFilter.isMarkerFileName(name)) return true
        return false
    }

    /** Makes dst a copy of src (with the skips), touching only what differs; extra: names in dst to leave alone */
    async syncDir(src, dst, extra = []){
        fs.mkdirSync(dst, {recursive: true})
        var keep = new Set(extra)
        var entries = []
        try { entries = fs.readdirSync(src, {withFileTypes: true}) } catch(err) { return keep }

        for (var e of entries) {
            var from = path.join(src, e.name)
            var to = path.join(dst, e.name)
            var isDir = e.isDirectory() || (e.isSymbolicLink() && fs.statSync(from).isDirectory())
            if (this.skipped(e.name, from, isDir)) continue
            keep.add(e.name)
            if (isDir) { await this.syncDir(from, to); continue }

            var s = fs.statSync(from)
            var d = null
            try { d = fs.statSync(to) } catch(err) {}
            var min = this.minifies(e.name)
            var sameTime = d && d.isFile() && Math.abs(d.mtimeMs - s.mtimeMs) < 1
            if (!this.rewriteAll && sameTime && (min || d.size === s.size)) { this.stats.kept++; continue }
            if (d && d.isDirectory()) fs.rmSync(to, {recursive: true, force: true})
            if (min) {
                var code = await this.minified(fs.readFileSync(from, 'utf8'), from)
                fs.writeFileSync(to, code)
                this.stats.bytes += Buffer.byteLength(code)
            } else {
                fs.copyFileSync(from, to)
                this.stats.bytes += s.size
            }
            fs.utimesSync(to, s.atime, s.mtime)
            this.stats.copied++
        }
        this.prune(dst, keep)
        return keep
    }

    /** Removes what's in dir but not in keep */
    prune(dir, keep){
        for (var name of fs.readdirSync(dir)) {
            if (keep.has(name)) continue
            fs.rmSync(path.join(dir, name), {recursive: true, force: true})
            this.stats.removed++
        }
    }

    /** A bundle, minified when asked; built from the same code as last time and still there, it's left alone */
    async writeBundle(file, content){
        if (!this.minifies(file)) return this.writeIfChanged(file, content)
        var rel = path.relative(this.out, file).replace(/\\/g, '/')
        var hash = crypto.createHash('sha1').update(content).digest('hex')
        if (this.manifest.bundles[rel] === hash && fs.existsSync(file)) { this.stats.kept++; return }
        this.writeIfChanged(file, await this.minified(content, file))
        this.manifest.bundles[rel] = hash
    }

    /** Writes a generated file only when its content changed, so its time (and Deployments' hash) stays put */
    writeIfChanged(file, content){
        fs.mkdirSync(path.dirname(file), {recursive: true})
        try { if (fs.readFileSync(file, 'utf8') === content) { this.stats.kept++; return } } catch(err) {}
        fs.writeFileSync(file, content)
        this.stats.copied++
        this.stats.bytes += Buffer.byteLength(content)
    }

    /* ---------------- bundles ---------------- */

    /** The js and css of components, as listed by sk.ui (the order pages load them in), from base + path */
    bundle(base, components){
        var js = [], css = []
        for (var c of components) {
            var stem = base + c.path + 'sk_ui_' + c.name
            try { css.push('/* sk_ui_' + c.name + ' */\n' + fs.readFileSync(stem + '.css', 'utf8')) } catch(err) {}
            try { js.push('/* sk_ui_' + c.name + ' */\n' + fs.readFileSync(stem + '.js', 'utf8')) } catch(err) {}
        }
        // Files are joined as they are (no minifying: template strings and the like stay intact). The ';' keeps one
        // file's last statement from running into the next file's first.
        return {js: js.join('\n;\n'), css: css.join('\n')}
    }

    async export(){
        var out = this.out
        var ui = this.sk.ui
        var p = this.sk.paths
        var uiPaths = p.sk_ui.frontend
        var keep = new Set()
        fs.mkdirSync(out, {recursive: true})
        this.loadManifest()

        // core, engine and shared components: one bundle for every page
        var general = [
            this.bundle(uiPaths.core, ui.components.core),
            this.bundle(uiPaths.engine, ui.components.engine || []),
            this.bundle(uiPaths.shared, ui.components.shared)
        ]
        await this.writeBundle(path.join(out, 'sk_ui.js'), general.map(b => b.js).filter(Boolean).join('\n;\n'))
        await this.writeBundle(path.join(out, 'sk_ui.css'), general.map(b => b.css).filter(Boolean).join('\n'))
        keep.add('sk_ui.js').add('sk_ui.css')

        // each view: its frontend, and a bundle of its components followed by the global ones
        var viewsOut = path.join(out, 'views')
        var viewIds = new Set()
        for (var _v in this.sk.views) {
            var view = this.sk.views[_v]
            var viewRoot = p.views + view.id + '/'
            var dir = path.join(viewsOut, view.id)
            await this.syncDir(viewRoot + 'frontend', dir, [view.id + '.js', view.id + '.css'])
            var comps = await ui.getComponentsFromPath(viewRoot + 'frontend/sk_ui/')
            var own = this.bundle(viewRoot + 'frontend/sk_ui/', comps)
            var global = this.bundle(uiPaths.global, ui.components.global)
            await this.writeBundle(path.join(dir, view.id + '.js'), [own.js, global.js].filter(Boolean).join('\n;\n'))
            await this.writeBundle(path.join(dir, view.id + '.css'), [own.css, global.css].filter(Boolean).join('\n'))
            viewIds.add(view.id)
        }
        fs.mkdirSync(viewsOut, {recursive: true})
        this.prune(viewsOut, viewIds)
        keep.add('views')

        await this.syncDir(p.superkraft + 'frontend', path.join(out, 'sk_frontend')); keep.add('sk_frontend')
        await this.syncDir(p.app_frontend, path.join(out, 'app_frontend')); keep.add('app_frontend')
        if (p.globalFrontend) { await this.syncDir(p.globalFrontend, path.join(out, 'app_global')); keep.add('app_global') }

        this.prune(out, keep)
        this.saveManifest()
        var mb = (this.stats.bytes / 1e6).toFixed(1)
        var min = this.minify.js || this.minify.css ? `, ${this.stats.minified} minified` : ''
        console.log(`[SK CDN] Exported to ${out}: ${this.stats.copied} written (${mb} MB)${min}, ${this.stats.kept} unchanged, ${this.stats.removed} removed`)
        if (this.stats.unminified.length) console.warn('[SK CDN] Went out unminified:\n  ' + this.stats.unminified.join('\n  '))
    }
}
