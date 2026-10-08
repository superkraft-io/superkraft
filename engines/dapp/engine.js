const fs = require('fs')

var _electron = require('electron')
const { app, nativeImage } = _electron

// Enable video autoplay without user gesture
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

var _os = require('os')

global.ejse = require('ejs-electron')

module.exports = class SK_LocalEngine extends SK_RootEngine {
    constructor(opt){
        super(opt)
        this.getSysInfo()
    }

    getSysInfo(){
        var os = _os.platform()
        if (os === 'darwin') os = 'mac'
        else os = 'win'


        var arch = 'x64'
       if (_os.cpus()[0].model.includes('Apple')) arch = 'arm'

        this.sk.info.sysInfo = {
            os: os,
            arch: arch
        }
    }

    async startOnlineMonitoring(){
        var busy = false

        var doOnce = async ()=>{
            sk.online = await sk.info.utils.checkInternetDNS()
            if (sk.online === sk.__lastOnlineStatus) return
            sk.info.ums.broadcast('isOnline', undefined, sk.online)
            sk.__lastOnlineStatus = sk.online
        }

        var waitForUMS = ()=>{
            return new Promise(resolve => {
                var check = setInterval(()=>{
                    if (sk.info.ums){
                        clearInterval(check)
                        resolve()
                    }
                }, 1000)
            })
        }
    
        await waitForUMS()

        setInterval(async()=>{
            if (busy) return
            busy = true
            await doOnce()
            busy = false
        }, 3000)

        doOnce()
    }

    init(){
        this.startOnlineMonitoring()

        return new Promise(resolve => {
            this.sk._os = _os
            this.sk.app = app
            this.app = app


            if (global.useUIOHookNAPI){
                const {uIOhook, UiohookKey} = require('uiohook-napi')
                global.uIOhook = uIOhook
                global.UiohookKey = UiohookKey
            }



            app.post = ()=>{} //dummy, to override rootEngine POST loader. POs are loaded  in this current init() function, below
            
            
            
            const WebSockets_Callback = require('wscb')
            var wscb = new WebSockets_Callback({asElectron: true,
                onUnexpectedMessage: msg => {
                    if (msg.cmd === 'terminate') app.quit()
                }
            })

            // `wscb` throws if a message arrives for an unregistered command.
            // In startup races this can happen before handlers are attached.
            var _handleExpectation = wscb.handleExpectation.bind(wscb)
            wscb.handleExpectation = (t, json, conn = undefined) => {
                var trigger = undefined
                if (t && t.triggers) trigger = t.triggers[json.cmd]

                if (!trigger || typeof trigger.doHandle !== 'function'){
                    if (t && t.options && typeof t.options.onUnexpectedMessage === 'function'){
                        try {
                            t.options.onUnexpectedMessage({
                                ...json,
                                error: 'unknown_command'
                            })
                        } catch(err) {
                            console.error(err)
                        }
                    } else {
                        console.warn('[wscb] Unknown command:', json.cmd)
                    }

                    if (conn && json && json.puid){
                        try {
                            t.send({
                                puid: json.puid,
                                rejected: true,
                                error: 'unknown_command',
                                cmd: json.cmd
                            }, undefined, undefined, conn)
                        } catch(err) {
                            console.error(err)
                        }
                    }

                    return
                }

                _handleExpectation(t, json, conn)
            }

            this.sk.wscb = wscb



            var postsFolder = this.sk.info.skModule.opt.postsRoot
            
            this.posts = {}

            var posts = fs.readdirSync(postsFolder)
            posts.forEach(_filename => {
                var postName = _filename.split('.')[0]
                    try {
                    var postModule = new (require(postsFolder + _filename))({sk: this.sk})

                    this.posts[postName] = postModule
                    
                    this.on(postModule.info.route, async (req, res)=>{
                        postModule.exec(req, res)
                    })
                } catch(err) {
                    console.error(err)
                }
            })


            app.on('window-all-closed', () => {
                // On mac it is common for applications and their menu bar
                // to stay active until the user quits explicitly with Cmd + Q
                /*if (this.sk.info.sysInfo.os !== 'mac'){
                    app.exit()
                }
                */

                this.terminate()
            })
            
            /*
            app.on('activate', () => {
                // On mac it's common to re-create a window in the
                // app when the dock icon is clicked and there are no
                // other windows open.
                if (BrowserWindow.getAllWindows().length === 0){
                    createWindow()
                }
            })*/

            

            this.sk.info.ums = new (require('../../modules/sk_ums.js'))({sk: this.sk, app: app})
                        

            resolve()
        })

    }

    // ejs-electron answers every file:// request with the whole file in one 200 response
    // (read synchronously, Range ignored). Chromium's media element cannot play from that,
    // so audio opened by path never played. Audio / video files are served here instead:
    // streamed from disk, with 206 responses for Range requests. Everything else stays with
    // ejs-electron.
    listenFileProtocol(){
        var protocol = _electron.protocol
        var handle = protocol.handle
        protocol.handle = (scheme, handler)=> {
            if (scheme !== 'file') return handle.call(protocol, scheme, handler)
            return handle.call(protocol, 'file', request => {
                var resolved = this.resolveMediaRequest(request)
                if (resolved) return this.serveMedia(request, resolved)
                var media = this.mediaFileRequest(request)
                return media ? this.serveMediaFile(request, media) : handler(request)
            })
        }
        // ejs-electron already listens from app 'ready': re-register through the wrapper.
        ejse.stopListening()
        try {
            ejse.listen()
        } finally {
            protocol.handle = handle
        }
    }

    // {pathname, type} for audio / video file URLs, else null.
    mediaFileRequest(request){
        var types = {
            wav: 'audio/wav', wave: 'audio/wav', mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac',
            flac: 'audio/flac', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', aif: 'audio/aiff',
            aiff: 'audio/aiff', caf: 'audio/x-caf', mp4: 'video/mp4', m4v: 'video/mp4', mov: 'video/quicktime',
            webm: 'video/webm', mkv: 'video/x-matroska'
        }
        var pathname
        try {
            var url = new URL(request.url)
            pathname = decodeURIComponent(url.pathname)
            if (process.platform === 'win32' && !url.host.trim()) pathname = pathname.substring(1)
        } catch (err) {
            return null
        }
        var type = types[require('path').extname(pathname).slice(1).toLowerCase()]
        return type ? {pathname: pathname, type: type} : null
    }

    // Media that is not a file as such (audio composed from several files, say): a resolver gets
    // the request URL and returns null, or {size, type, read(start, end) → Readable of bytes
    // [start, end]}. The response gets the same range handling as a file.
    addMediaResolver(resolver){
        if (!this.mediaResolvers) this.mediaResolvers = []
        this.mediaResolvers.push(resolver)
        return ()=> {
            this.mediaResolvers = this.mediaResolvers.filter(r => r !== resolver)
        }
    }

    resolveMediaRequest(request){
        for (var resolver of this.mediaResolvers || []) {
            try {
                var media = resolver(request.url)
                if (media) return media
            } catch (err) {
                console.error('Media resolver failed', err)
            }
        }
        return null
    }

    async serveMediaFile(request, media){
        var stat
        try {
            stat = await fs.promises.stat(media.pathname)
        } catch (err) {
            return new Response(null, {status: 404, statusText: 'Not Found'})
        }
        return this.serveMedia(request, {
            size: stat.size,
            type: media.type,
            read: (start, end)=> fs.createReadStream(media.pathname, {start: start, end: end})
        })
    }

    async serveMedia(request, media){
        var size = media.size
        var headers = {'Content-Type': media.type, 'Accept-Ranges': 'bytes'}
        var range = /^bytes=(\d*)-(\d*)$/.exec(String(request.headers.get('range') || '').trim())
        var start = 0
        var end = size - 1
        var status = 200
        if (range && (range[1] || range[2])) {
            if (range[1]) {
                start = Number(range[1])
                if (range[2]) end = Math.min(size - 1, Number(range[2]))
            } else {
                start = Math.max(0, size - Number(range[2]))
            }
            if (start >= size || start > end) {
                return new Response(null, {status: 416, headers: {'Content-Range': 'bytes */' + size}})
            }
            status = 206
            headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + size
        }
        headers['Content-Length'] = String(Math.max(0, end - start + 1))
        if (request.method === 'HEAD' || size === 0) return new Response(null, {status: status, headers: headers})
        var stream = require('stream').Readable.toWeb(media.read(start, end))
        return new Response(stream, {status: status, headers: headers})
    }

    async waitForReady(){
        await app.whenReady()

        if (process.platform === 'darwin' && app.dock && this.sk.info.paths.icons.app) {
            const dockIcon = nativeImage.createFromPath(this.sk.info.paths.icons.app)
            if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon)
        }

        this.listenFileProtocol()
    
        this.deeplink = new (require('./modules/sk_dapp_deeplink.js'))({sk: this.sk})
        this.sk.country = app.getLocale().split('-')[0]

        if (this.sk.onAppReady) this.sk.onAppReady()

        if (global.uIOhook){
            global.uIOhook.on('mouseup', _e => {
                for (var vid in this.sk.info.views) this.sk.info.views[vid].handleMouseUp()
            })
            global.uIOhook.start()
        }
    }

    on(cmd, cb){
        this.sk.wscb.on(cmd, async (msg, rW) => {
            cb(msg, rW)
        })
    }

    async terminate(){
        this.closeAllViews()
        this.sk.info.timers.destroyAll()

        if (this.sk.info.onBeforeTerminate) await this.sk.onBeforeTerminate()

        process.exit()
    }

    closeAllViews(){
        for (var i in this.sk.info.views){
            var view = this.sk.info.views[i]
            if (view.closed === false) view.close()
        }
    }

    flog(data){
        this.sk.info.ums.broadcast('sk_flog', data)
    }


    onViewsInitialized(){
        for (var i in this.sk.info.views){
            var view = this.sk.info.views[i]
            view.onClosed = ()=>{ this.onViewClosed() }
        }
    }

    checkIfAllViewsClosed(){
        var created = []

        for (var i in this.sk.info.views){
            var view = this.sk.info.views[i]
            var _view = view._view
            if (_view) created.push(view)
        }

        if (created.length === 0) return

        for (var i in created){
            var view = created[i]
            if (view.closed === false) return
        }
        
        return true
    }

    onViewClosed(){
        if (this.checkIfAllViewsClosed()) this.terminate()
    }
}