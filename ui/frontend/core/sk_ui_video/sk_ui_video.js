class sk_ui_video extends sk_ui_component {
    constructor(opt){
        super({...{htmlTag: 'video'}, ...opt})

        this.attributes.add({friendlyName: 'Source', name: 'src', type: 'text', onSet: async val => {
            this.loadFromURL(val)
        }})

        // Debug events
        this.element.addEventListener('loadstart', () => console.log('Video: loadstart'))
        this.element.addEventListener('loadedmetadata', () => console.log('Video: loadedmetadata'))
        this.element.addEventListener('loadeddata', () => console.log('Video: loadeddata'))
        this.element.addEventListener('canplay', () => console.log('Video: canplay'))
        this.element.addEventListener('canplaythrough', () => console.log('Video: canplaythrough'))
        this.element.addEventListener('play', () => console.log('Video: play'))
        this.element.addEventListener('playing', () => console.log('Video: playing'))
        this.element.addEventListener('error', (e) => console.error('Video error:', this.element.error))

        this.attributes.add({friendlyName: 'Autoplay', name: 'autoplay', type: 'bool', onSet: async val => {
            this.element.autoplay = val
        }})

        this.attributes.add({friendlyName: 'Muted', name: 'muted', type: 'bool', onSet: async val => {
            this.element.muted = val
        }})

        this.attributes.add({friendlyName: 'Loop', name: 'loop', type: 'bool', onSet: async val => {
            this.element.loop = val
        }})

        this.attributes.add({friendlyName: 'Preload', name: 'preload', type: 'text', onSet: async val => {
            this.element.preload = val
        }})

        this.attributes.add({friendlyName: 'Poster', name: 'poster', type: 'text', onSet: async val => {
            this.element.poster = val
        }})

        this.attributes.add({friendlyName: 'Plays Inline', name: 'playsinline', type: 'bool', onSet: async val => {
            this.element.playsInline = val
            if (val) this.element.setAttribute('playsinline', '')
            else this.element.removeAttribute('playsinline')
        }})

        this.attributes.add({friendlyName: 'Controls', name: 'controls', type: 'bool', onSet: async val => {
            this.element.controls = val
        }})

        this.attributes.add({friendlyName: 'Volume', name: 'volume', type: 'number', onSet: async val => {
            this.element.volume = Math.max(0, Math.min(1, val))
        }})

        this.attributes.add({friendlyName: 'Playback Rate', name: 'playbackRate', type: 'number', onSet: async val => {
            this.element.playbackRate = val
        }})

        this.attributes.add({friendlyName: 'Current Time', name: 'currentTime', type: 'number', onSet: async val => {
            this.element.currentTime = val
        }})

        this.attributes.add({friendlyName: 'Disable Picture-in-Picture', name: 'disablePictureInPicture', type: 'bool', onSet: async val => {
            this.element.disablePictureInPicture = val
        }})

        this.attributes.add({friendlyName: 'Disable Remote Playback', name: 'disableRemotePlayback', type: 'bool', onSet: async val => {
            this.element.disableRemotePlayback = val
        }})

        this.attributes.add({friendlyName: 'Crossorigin', name: 'crossorigin', type: 'text', onSet: async val => {
            this.element.crossOrigin = val
        }})

        // Set attributes directly on the element to ensure autoplay works
        this.element.muted = true
        this.element.autoplay = true
        this.element.loop = true
        this.element.preload = 'auto'
        this.element.playsInline = true
        this.element.setAttribute('playsinline', '')
        this.element.setAttribute('muted', '')
        this.element.setAttribute('autoplay', '')

        this.autoplay = true
        this.muted = true
        this.loop = true
        this.preload = 'auto'
        this.playsinline = true

        if (opt.extraOpt){
            for (let key in opt.extraOpt){
                var attr = this.attributes.findByID(key)
                if (!attr) continue
                
                this[key] = opt.extraOpt[key]
            }
        }


    }

    play() {
        const playPromise = this.element.play()
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('Video autoplay blocked:', err)
            })
        }
    }

    pause() {
        this.element.pause()
    }

    stop() {
        this.element.pause()
        this.element.currentTime = 0
    }

    loadFromBlob(blob, mimeType = 'video/mp4') {
        if (this._blobUrl) {
            URL.revokeObjectURL(this._blobUrl)
        }
        this._blobUrl = URL.createObjectURL(blob)
        this.element.src = this._blobUrl
    }

    loadFromBase64(base64, mimeType = 'video/mp4') {
        this.element.src = `data:${mimeType};base64,${base64}`
    }

    loadFromArrayBuffer(arrayBuffer, mimeType = 'video/mp4') {
        const blob = new Blob([arrayBuffer], { type: mimeType })
        this.loadFromBlob(blob, mimeType)
    }

    loadFromFile(file) {
        this.loadFromBlob(file, file.type || 'video/mp4')
    }

    async loadFromURL(url) {
        const response = await fetch(url)
        const blob = await response.blob()
        this.loadFromBlob(blob, blob.type || 'video/mp4')
    }

    dispose() {
        if (this._blobUrl) {
            URL.revokeObjectURL(this._blobUrl)
            this._blobUrl = null
        }
    }
}