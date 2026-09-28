const fs = require('fs')
const nodePath = require('path')

// Per-app-type exclusion.
//   UI component folder: an (empty) file named `.ignore_on_<type>` in an sk_ui_* folder
//     skips that folder and everything inside it — no tags, no CDN bundle, and on wapp
//     its files are not served (404).
//   Action file: first non-empty line `// .ignore_on_<type>` — the file is never required.
// <type> is the Superkraft app type (wapp, dapp, ...). Nothing changes without a marker.
module.exports = class SK_AppTypeFilter {
    static CACHE_MS = 5000

    constructor(opt){
        this.type = opt.type
        this.marker = '.ignore_on_' + this.type
        this.dirCache = new Map()
    }

    isMarkerFileName(name){
        return typeof name === 'string' && name.indexOf('.ignore_on_') === 0
    }

    // Folder itself carries the marker (callers skip its subtree).
    async isDirIgnored(dirPath){
        var dir = String(dirPath).replace(/[\\/]+$/, '')
        var cached = this.readCache(dir)
        if (cached !== undefined) return cached
        var ignored = false
        try {
            await sk_fs.promises.access(dir + '/' + this.marker)
            ignored = true
        } catch(err) {}
        this.writeCache(dir, ignored)
        return ignored
    }

    isDirIgnoredSync(dirPath){
        var dir = String(dirPath).replace(/[\\/]+$/, '')
        var cached = this.readCache(dir)
        if (cached !== undefined) return cached
        var ignored = false
        try { ignored = fs.existsSync(nodePath.join(dir, this.marker)) } catch(err) {}
        this.writeCache(dir, ignored)
        return ignored
    }

    // Any folder from the file's folder up to (and including) root carries the marker.
    isPathIgnoredSync(filePath, root){
        var rootDir = nodePath.resolve(root)
        var dir = nodePath.resolve(filePath)
        try { if (!fs.statSync(dir).isDirectory()) dir = nodePath.dirname(dir) } catch(err) { dir = nodePath.dirname(dir) }
        while (dir.length >= rootDir.length && dir.indexOf(rootDir) === 0) {
            if (this.isDirIgnoredSync(dir)) return true
            var parent = nodePath.dirname(dir)
            if (parent === dir) break
            dir = parent
        }
        return false
    }

    async isActionFileIgnored(filePath){
        try {
            var head = String(await sk_fs.promises.readFile(filePath)).slice(0, 512)
            var firstLine = head.replace(/^﻿/, '').split(/\r?\n/).find(line => line.trim().length > 0)
            if (!firstLine) return false
            var match = firstLine.trim().match(/^\/\/\s*(\.ignore_on_\w+(?:\s+\.ignore_on_\w+)*)\s*$/)
            return !!(match && match[1].split(/\s+/).indexOf(this.marker) !== -1)
        } catch(err) {
            return false
        }
    }

    // express middleware placed before express.static(root): 404 for ignored folders.
    staticGuard(root){
        return (req, res, next) => {
            var rel
            try { rel = decodeURIComponent(req.path || '') } catch(err) { return res.status(400).end() }
            var target = nodePath.join(root, rel)
            if (nodePath.resolve(target).indexOf(nodePath.resolve(root)) !== 0) return next()
            if (this.isMarkerFileName(nodePath.basename(target)) || this.isPathIgnoredSync(target, root)) {
                return res.status(404).end()
            }
            next()
        }
    }

    readCache(dir){
        var entry = this.dirCache.get(dir)
        if (!entry) return undefined
        if (Date.now() - entry.at > SK_AppTypeFilter.CACHE_MS) {
            this.dirCache.delete(dir)
            return undefined
        }
        return entry.ignored
    }

    writeCache(dir, ignored){
        this.dirCache.set(dir, {ignored: ignored, at: Date.now()})
    }
}
