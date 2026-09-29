// Directional trackpad pinch for dapp windows (macOS).
//
// Chromium only hands the page a ctrl+wheel scale for a pinch. The native addon
// reports finger positions, and this emits a 'pinch-gesture' event on the
// BrowserWindow (alongside Electron's own 'swipe' / 'rotate-gesture'):
//
//   {phase: 'begin'|'update'|'end', magnification, touches: [{x, y}], deviceWidth, deviceHeight}
//
// touches are normalized trackpad positions (0..1), device size is in points.
// Loads a local node-gyp build if present, else the committed universal
// prebuilt (see build.sh). Without either (or off macOS) attach() returns false.

var path = require('path')

var MAGNIFY = 30
var PHASES = {1: 'begin', 4: 'update', 8: 'end', 16: 'end'}

class SK_DAPP_Pinch {
    constructor(){
        this.addon = null
        this.windows = new Map()

        if (process.platform !== 'darwin') return
        var candidates = [
            path.join(__dirname, 'build', 'Release', 'sk_dapp_pinch.node'),
            path.join(__dirname, 'prebuilt', 'darwin-universal', 'sk_dapp_pinch.node')
        ]
        for (var file of candidates) {
            try {
                this.addon = require(file)
                break
            } catch (err) {}
        }
        if (!this.addon) return
        try {
            this.addon.init(sample => this.onSample(sample))
        } catch (err) {
            this.addon = null
        }
    }

    attach(win){
        if (!this.addon || !win) return false
        var windowId = 0
        try { windowId = this.addon.attach(win.getNativeWindowHandle()) } catch (err) { return false }
        if (!windowId) return false

        this.windows.set(windowId, {win: win, touchSample: null})
        win.once('closed', () => this.windows.delete(windowId))
        return true
    }

    onSample(sample){
        var entry = this.windows.get(sample.windowId)
        if (!entry || entry.win.isDestroyed()) return

        if (sample.type !== MAGNIFY) {
            if (sample.touches.length >= 2) entry.touchSample = sample
            return
        }

        var phase = PHASES[sample.phase]
        if (!phase) return

        var touchSample = entry.touchSample
        entry.win.emit('pinch-gesture', {
            phase: phase,
            magnification: sample.magnification,
            touches: touchSample ? touchSample.touches : [],
            deviceWidth: touchSample ? touchSample.deviceWidth : 0,
            deviceHeight: touchSample ? touchSample.deviceHeight : 0
        })

        if (phase === 'end') entry.touchSample = null
    }
}

module.exports = new SK_DAPP_Pinch()
