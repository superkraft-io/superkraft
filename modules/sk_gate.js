const fs = require('fs')
const nodePath = require('path')

// Paid / entitled UI components (wapp).
//   An (empty) file named `.requires_<feature>` in an sk_ui_* folder gates that folder and
//   everything inside it: no tags in the page, no CDN bundle, and its .js / .css are never
//   served as static files. The page fetches them in one bundle from
//   GET /sk_gated/<viewId>/<feature>.js|.css, with code only when
//   opt.onCheckEntitlement(req, feature) resolves true. A denied .js still answers 200 with a
//   one-line verdict (sk.ui.loadGated reads it), so free users get no console errors; a
//   denied .css is a 403.
// Without onCheckEntitlement, or on any app type but wapp, markers are ignored and gated
// folders load like any other.
module.exports = class SK_Gate {
    static CACHE_MS = 5000
    static MARKER_PREFIX = '.requires_'

    constructor(opt){
        this.sk = opt.sk
        this.check = opt.onCheckEntitlement
        this.active = opt.type === 'wapp' && typeof this.check === 'function'
        this.dirCache = new Map()
        this.bundleCache = new Map()
    }

    isMarkerFileName(name){
        return typeof name === 'string' && name.indexOf(SK_Gate.MARKER_PREFIX) === 0
    }

    // Feature the folder itself is gated by, or null.
    featureOfDirSync(dirPath){
        if (!this.active) return null
        var dir = String(dirPath).replace(/[\\/]+$/, '')
        var entry = this.dirCache.get(dir)
        if (entry && Date.now() - entry.at < SK_Gate.CACHE_MS) return entry.feature
        var feature = null
        try {
            var marker = fs.readdirSync(dir).find(name => this.isMarkerFileName(name))
            if (marker) feature = marker.slice(SK_Gate.MARKER_PREFIX.length)
        } catch(err) {}
        this.dirCache.set(dir, {feature: feature, at: Date.now()})
        return feature
    }

    // Any folder from the file's folder up to (and including) root carries a marker.
    isPathGatedSync(filePath, root){
        var rootDir = nodePath.resolve(root)
        var dir = nodePath.dirname(nodePath.resolve(filePath))
        while (dir.length >= rootDir.length && dir.indexOf(rootDir) === 0) {
            if (this.featureOfDirSync(dir)) return true
            var parent = nodePath.dirname(dir)
            if (parent === dir) break
            dir = parent
        }
        return false
    }

    // express middleware placed before express.static(root): gated code is only served bundled.
    staticGuard(root){
        return (req, res, next) => {
            if (!this.active) return next()
            var rel
            try { rel = decodeURIComponent(req.path || '') } catch(err) { return res.status(400).end() }
            var target = nodePath.join(root, rel)
            if (nodePath.resolve(target).indexOf(nodePath.resolve(root)) !== 0) return next()
            if (this.isMarkerFileName(nodePath.basename(target))) return res.status(404).end()
            var ext = nodePath.extname(target).toLowerCase()
            if ((ext === '.js' || ext === '.css') && this.isPathGatedSync(target, root)) return res.status(404).end()
            next()
        }
    }

    // Gated component folders under uiRoot for one feature, in page order (children first,
    // then the folder, alphabetical), the same order sk_ui lists components in.
    listGatedComponents(uiRoot, feature){
        var results = []
        var walk = (dir, relPath, gatedBy) => {
            var names
            try { names = fs.readdirSync(dir).sort() } catch(err) { return }
            for (var name of names) {
                var full = nodePath.join(dir, name)
                if (name.indexOf('sk_ui_') === -1) continue
                try { if (!fs.statSync(full).isDirectory()) continue } catch(err) { continue }
                if (this.sk.appTypeFilter && this.sk.appTypeFilter.isDirIgnoredSync(full)) continue
                var effective = this.featureOfDirSync(full) || gatedBy
                var rel = relPath + name + '/'
                walk(full, rel, effective)
                if (effective === feature) results.push({name: name.replace('sk_ui_', ''), path: rel, dir: full})
            }
        }
        walk(uiRoot, '', null)
        return results
    }

    readOrEmpty(file){
        try { return fs.readFileSync(file).toString() } catch(err) { return '' }
    }

    buildBundle(uiRoot, feature, viewUiRoute){
        var components = this.listGatedComponents(uiRoot, feature)
        var js = []
        var css = []
        for (var c of components) {
            var base = nodePath.join(c.dir, 'sk_ui_' + c.name)
            var code = this.readOrEmpty(base + '.js')
            if (code) js.push(code)
            var style = this.readOrEmpty(base + '.css')
            if (style) css.push(style)
        }
        // Same registration the page does for listed components (script.ejs).
        var register = components.map(c =>
            'if (typeof sk_ui_' + c.name + ' !== "undefined") {'
            + ' sk_ui_' + c.name + '.root_url = ' + JSON.stringify(viewUiRoute + c.path) + ';'
            + ' sk.ui.components.lists.view[' + JSON.stringify(c.name) + '] = sk_ui_' + c.name + ' }'
        )
        return {
            js: js.join('\n;\n') + '\n;\n' + register.join('\n') + '\n' + this.verdict(feature, true),
            css: css.join('\n'),
            count: components.length
        }
    }

    verdict(feature, entitled){
        return 'sk.ui.gatedVerdicts[' + JSON.stringify(feature) + '] = ' + (entitled ? 'true' : 'false') + '\n'
    }

    getBundle(uiRoot, feature, viewUiRoute){
        var key = uiRoot + '|' + feature
        var entry = this.bundleCache.get(key)
        if (entry && Date.now() - entry.at < SK_Gate.CACHE_MS) return entry.bundle
        var bundle = this.buildBundle(uiRoot, feature, viewUiRoute)
        this.bundleCache.set(key, {bundle: bundle, at: Date.now()})
        return bundle
    }

    // GET /sk_gated/<viewId>/<feature>.js|.css for one view.
    route(app, viewId, uiRoot, viewUiRoute){
        if (!this.active) return
        app.get('/sk_gated/' + viewId + '/:file', async (req, res) => {
            var match = /^([A-Za-z0-9_-]+)\.(js|css)$/.exec(req.params.file || '')
            if (!match) return res.status(404).end()
            var feature = match[1]
            var ext = match[2]
            res.set('Cache-Control', 'private, no-store')
            var entitled = false
            try { entitled = await this.check(req, feature) === true } catch(err) {
                console.error('[SK] Entitlement check failed for ' + feature, err)
            }
            if (!entitled) {
                if (ext === 'css') return res.status(403).end()
                return res.type('application/javascript').send(this.verdict(feature, false))
            }
            var bundle = this.getBundle(uiRoot, feature, viewUiRoute)
            if (!bundle.count) return res.status(404).end()
            res.type(ext === 'js' ? 'application/javascript' : 'text/css')
            res.send(ext === 'js' ? bundle.js : bundle.css)
        })
    }
}
