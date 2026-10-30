// Desktop: OS windows that show a part of this page. A window.open child shares this page's JS heap,
// so a component moved into one keeps its studio, audio graph and GPU device as it was. What differs is
// everything bound to this page's own window and document; this file evens that out:
//  - input listeners on `document` / `window` are also attached to every child, whichever came first,
//    so a drag or a shortcut works in a child without its code knowing about children
//  - stylesheets and the classes and inline style of <html> and <body> are copied and kept in step
//  - document.activeElement answers for the window that has focus
//  - requestAnimationFrame runs while any window is on screen, not only this one
// Loaded first (engine_body.ejs): a listener added before this file would not be mirrored.
var sk_nativeWindows = new (class SK_NativeWindows {
    constructor(){
        this.windows = []
        this.spare = null
        this.seq = 0
        this.mirrored = new Set([
            'pointerdown', 'pointermove', 'pointerup', 'pointercancel',
            'mousedown', 'mousemove', 'mouseup', 'click', 'dblclick', 'auxclick', 'contextmenu', 'wheel',
            'touchstart', 'touchmove', 'touchend', 'touchcancel',
            'keydown', 'keyup', 'keypress',
            'dragstart', 'dragenter', 'dragover', 'dragleave', 'dragend', 'drop',
            'copy', 'cut', 'paste', 'focusin', 'focusout'
        ])
        this.listeners = {document: [], window: []}

        this.mirrorListeners(document, 'document')
        this.mirrorListeners(window, 'window')
        this.answerActiveElement()
        this.followAnimationFrames()

        window.addEventListener('pagehide', ()=> this.all.slice().forEach(entry => entry.close()))
    }

    mirrorListeners(target, kind){
        var list = this.listeners[kind]
        var add = target.addEventListener
        var remove = target.removeEventListener
        var capture = options => typeof options === 'boolean' ? options : !!(options && options.capture)
        var targetsOf = ()=> this.all.map(entry => kind === 'document' ? entry.document : entry.window)

        var drop = entry => {
            var at = list.indexOf(entry)
            if (at !== -1) list.splice(at, 1)
            remove.call(target, entry.type, entry.fn, entry.options)
            targetsOf().forEach(other => other.removeEventListener(entry.type, entry.fn, entry.options))
        }

        target.addEventListener = (type, listener, options) => {
            if (!listener || !this.mirrored.has(type)) return add.call(target, type, listener, options)
            if (list.some(entry => entry.type === type && entry.listener === listener && capture(entry.options) === capture(options))) return

            var entry = {type, listener, options, fn: listener}
            // Once across all windows, not once per window.
            if (options && options.once) entry.fn = function(_e){
                drop(entry)
                return typeof listener === 'function' ? listener.call(this, _e) : listener.handleEvent(_e)
            }
            if (options && options.signal) options.signal.addEventListener('abort', ()=> drop(entry))
            list.push(entry)
            add.call(target, type, entry.fn, options)
            targetsOf().forEach(other => other.addEventListener(type, entry.fn, options))
        }

        target.removeEventListener = (type, listener, options) => {
            var entry = list.find(entry => entry.type === type && entry.listener === listener && capture(entry.options) === capture(options))
            if (entry) drop(entry)
            else remove.call(target, type, listener, options)
        }
    }

    answerActiveElement(){
        var own = Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement')
        Object.defineProperty(document, 'activeElement', {
            configurable: true,
            get: ()=> {
                var focused = this.windows.find(entry => entry.document.hasFocus())
                return focused ? focused.document.activeElement : own.get.call(document)
            }
        })
    }

    // A page Chromium considers hidden (covered by another app) gets no frames, but its child can still be
    // on screen, with this page's code drawing into it. While children exist, ask every window; the first answers.
    followAnimationFrames(){
        var request = window.requestAnimationFrame.bind(window)
        var cancel = window.cancelAnimationFrame.bind(window)
        var pending = new Map()
        var nextId = 0

        window.requestAnimationFrame = callback => {
            if (!this.windows.length) return request(callback)
            var id = 'sk_nativeWindows_' + (++nextId)
            var asks = []
            var run = time => {
                if (!pending.delete(id)) return
                asks.forEach(ask => ask.cancel())
                callback(time)
            }
            asks.push({cancel: (handle => ()=> cancel(handle))(request(run))})
            this.windows.forEach(entry => {
                var view = entry.window
                // Its frame time, on this page's clock.
                var offset = view.performance.timeOrigin - performance.timeOrigin
                var handle = view.requestAnimationFrame(time => run(time + offset))
                asks.push({cancel: ()=> { if (!view.closed) view.cancelAnimationFrame(handle) }})
            })
            pending.set(id, asks)
            return id
        }

        window.cancelAnimationFrame = id => {
            var asks = pending.get(id)
            if (!asks) return cancel(id)
            pending.delete(id)
            asks.forEach(ask => ask.cancel())
        }
    }

    copyAttributes(from, to){
        ;['class', 'style'].forEach(name => {
            var value = from.getAttribute(name)
            if (value === null) to.removeAttribute(name)
            else if (to.getAttribute(name) !== value) to.setAttribute(name, value)
        })
    }

    copyStyles(entry){
        var loads = []
        var targetHead = entry.document.head
        var copy = node => {
            var copied = entry.document.importNode(node, true)
            if (node.tagName === 'LINK') {
                copied.href = node.href
                loads.push(new Promise(resolve => {
                    copied.addEventListener('load', resolve)
                    copied.addEventListener('error', resolve)
                }))
            }
            targetHead.appendChild(copied)
        }
        document.querySelectorAll('link[rel="stylesheet"], style').forEach(copy)
        entry.copyStyle = copy
        return Promise.all(loads)
    }

    // Styles added to the page later, and its classes (a theme, a drag's body cursor).
    keepInStep(){
        if (this.observer) return
        this.observer = new MutationObserver(records => {
            records.forEach(record => {
                if (record.type === 'attributes') {
                    var isRoot = record.target === document.documentElement
                    this.all.forEach(entry => this.copyAttributes(record.target, isRoot ? entry.document.documentElement : entry.document.body))
                    return
                }
                record.addedNodes.forEach(node => {
                    if (node.tagName !== 'STYLE' && !(node.tagName === 'LINK' && node.rel === 'stylesheet')) return
                    this.all.forEach(entry => entry.copyStyle(node))
                })
            })
        })
        this.observer.observe(document.head, {childList: true})
        this.observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class', 'style']})
        this.observer.observe(document.body, {attributes: true, attributeFilter: ['class', 'style']})
    }

    // {title, width, height, minWidth, minHeight, resizable, onCloseRequested, onFocus}. Null when the window can't
    // be opened: the caller stays in the page. onCloseRequested: the OS asked (Alt+F4); the window stays until close().
    open(opt = {}){
        var entry = this.spare || this.createWindow()
        if (!entry) return null
        this.spare = null

        entry.opt = opt
        entry.document.title = opt.title || ''
        entry.size = {width: Math.round(opt.width), height: Math.round(opt.height)}
        this.windows.push(entry)
        entry.command('place', {
            width: entry.size.width,
            height: entry.size.height,
            minWidth: opt.minWidth,
            minHeight: opt.minHeight,
            resizable: opt.resizable !== false,
            cascade: this.windows.length - 1
        })
        this.warm(1500)
        return entry
    }

    // A window opens in a third of a second, all of it on this thread, and takes as long again to get its
    // stylesheets. So one waits hidden and ready. Call once from a page that opens windows.
    warm(delay = 3000){
        if (this.spare || this.warmTimer) return
        this.warmTimer = setTimeout(()=> {
            requestIdleCallback(()=> {
                this.warmTimer = null
                if (!this.spare) this.spare = this.createWindow()
            }, {timeout: 2000})
        }, delay)
    }

    // Hidden, sized and shown by the main process (rootView): in the child, window.outerWidth and screenX can
    // answer with this page's values, and window.resizeTo and moveTo work from those.
    createWindow(){
        var name = 'sk_nativeWindow_' + (++this.seq)
        var view = window.open('about:blank', name)
        if (!view) return null

        var entry = {
            window: view,
            document: view.document,
            body: view.document.body,
            opt: {},
            closing: false,
            size: {width: 0, height: 0},
            command: (command, arg) => require('electron').ipcRenderer.send('sk_nativeWindow', name, command, arg),
            resize: (width, height) => {
                width = Math.round(width)
                height = Math.round(height)
                if (entry.closing || (width === entry.size.width && height === entry.size.height)) return
                entry.size = {width, height}
                entry.command('resize', {width, height})
            },
            limit: (minWidth, minHeight) => {
                if (!entry.closing) entry.command('limit', {minWidth, minHeight})
            },
            focus: ()=> { if (!entry.closing) entry.command('focus') },
            close: ()=> {
                if (entry.closing) return
                entry.closing = true
                this.forget(entry)
                view.close()
            }
        }

        var doc = entry.document
        var base = doc.createElement('base')
        base.href = document.baseURI
        doc.head.appendChild(base)

        var page = doc.createElement('style')
        page.textContent = 'html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }'
        doc.head.appendChild(page)

        // Dark until its stylesheets are in, not a flash of unstyled controls.
        var hold = doc.createElement('style')
        hold.textContent = 'html { visibility: hidden; }'
        doc.head.appendChild(hold)
        this.copyStyles(entry).then(()=> hold.remove())

        this.copyAttributes(document.documentElement, doc.documentElement)
        this.copyAttributes(document.body, doc.body)

        this.listeners.document.forEach(item => doc.addEventListener(item.type, item.fn, item.options))
        this.listeners.window.forEach(item => view.addEventListener(item.type, item.fn, item.options))

        view.addEventListener('beforeunload', _e => {
            if (entry.closing) return
            _e.preventDefault()
            _e.returnValue = false
            if (entry.opt.onCloseRequested) setTimeout(entry.opt.onCloseRequested, 0)
        })
        view.addEventListener('pagehide', ()=> {
            entry.closing = true
            this.forget(entry)
        })
        view.addEventListener('focus', ()=> { if (entry.opt.onFocus) entry.opt.onFocus() })

        this.keepInStep()
        return entry
    }

    // Every child, shown or the spare.
    get all(){
        return this.spare ? this.windows.concat(this.spare) : this.windows
    }

    forget(entry){
        var at = this.windows.indexOf(entry)
        if (at !== -1) this.windows.splice(at, 1)
        if (this.spare === entry) this.spare = null
        if (this.all.length || !this.observer) return
        this.observer.disconnect()
        this.observer = null
    }

    // Where a prompt opens: the OS window the user is in, if they are in one.
    focusedHost(){
        var focused = this.windows.find(entry => entry.document.hasFocus())
        return focused ? focused.window.sk_overlayHost : null
    }

    // querySelectorAll across this page and every child.
    querySelectorAll(selector){
        var found = Array.from(document.querySelectorAll(selector))
        this.windows.forEach(entry => found.push(...entry.document.querySelectorAll(selector)))
        return found
    }
})()
