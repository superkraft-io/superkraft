class sk_ui_thinkingBtn extends sk_ui_component {
    static get colormaps(){
        return {
            iridescence: ['#ff28c8', '#00e6ff', '#fff546', '#28ffa0', '#a03cff'],
            rainbow: ['#ff3b3b', '#ff8c00', '#ffe600', '#32d74b', '#00c8ff', '#7a5cff', '#ff2d95'],
            magma: ['#55177d', '#b83779', '#fc8e64', '#fcfdbf'],
            plasma: ['#0d0887', '#8b0aa5', '#db5c68', '#f4b449', '#f0f921'],
            viridis: ['#440154', '#31688e', '#35b779', '#fde725'],
            inferno: ['#1b0c41', '#781c6d', '#ed6925', '#fcffa4'],
            ice: ['#0b1d4a', '#1f6feb', '#5ce1ff', '#e8ffff'],
            fire: ['#3b0a00', '#ff3b00', '#ffb000', '#fff3a0'],
            aurora: ['#0b3d2e', '#1cff9a', '#7dffe0', '#b08cff', '#3d1b6e'],
            sunset: ['#2a1040', '#ff3d7a', '#ff7a3d', '#ffd166', '#fff1c1'],
            toxic: ['#122400', '#b8ff00', '#6cff2a', '#ff00d0', '#d0ff4a'],
            neon: ['#ff00ea', '#00f0ff', '#f8ff00', '#7a00ff', '#00ff9c'],
            ocean: ['#021526', '#0b4f8a', '#14b8c8', '#7ef0d2', '#e8fff8'],
            candy: ['#ff4fa3', '#ff9ec8', '#c9a7ff', '#8ef0d0', '#ffe08a'],
            copper: ['#2a1208', '#8a3a12', '#d2691e', '#f0a36b', '#ffe0b8'],
            voltage: ['#0a1630', '#1e6bff', '#7ef0ff', '#fff36b', '#ffffff'],
            twilight: ['#0d0820', '#3b1d7a', '#8b4dff', '#ff6bb5', '#ffd6a0'],
            acid: ['#1a2200', '#ccff00', '#66ff99', '#00ffd0', '#e8ff6a']
        }
    }

    constructor(opt){
        super(opt)
        this.multiComponent = true
        this.compact = true
        this.animate = false
        this.classAdd('sk_ui_thinkingBtn')
        this._washes = []
        this._washAnims = new Map()
        this._washTimers = []
        this._colors = sk_ui_thinkingBtn.colormaps.iridescence.slice()

        this.glow = this.add.component(_c => {
            _c.classAdd('sk_ui_thinkingBtn_glow')
            _c.compact = true
            _c.animate = false
            _c.pointerEvents = 'none'
            _c.style.position = 'absolute'
            _c.style.left = '50%'
            _c.style.top = '50%'
            _c.style.width = '125%'
            _c.style.height = '125%'
            _c.style.transform = 'translate(-50%, -50%)'
        })

        this.borderOutline = this.add.fromClass(sk_ui_thinkingBtn_borderOutline)
        this.button = this.add.fromClass(sk_ui_thinkingBtn_button, _c => {
            _c.onClick = (event, btn) => {
                if (this.thinking && this.lockWhileThinking !== false) return
                if (this.onClick) this.onClick(event, this)
            }
        })

        this.addWashes(this.glow.element)
        this.addWashes(this.borderOutline.element, {bright: true})
        this.addWashes(this.button.element)
        this.applyColors(this._colors)

        this.attributes.add({friendlyName: 'Text', name: 'text', type: 'text', onSet: val => {
            this.button.text = val
        }})

        this.attributes.add({friendlyName: 'Icon', name: 'icon', type: 'text', onSet: val => {
            this.button.icon = val
        }})

        this.attributes.add({friendlyName: 'Size', name: 'size', type: 'number', onSet: val => {
            this.button.size = val
        }})

        this.attributes.add({friendlyName: 'Colors', name: 'colors', type: 'text', onSet: val => {
            this.applyColors(val)
        }})

        this.attributes.add({friendlyName: 'Thinking', name: 'thinking', type: 'bool', onSet: val => {
            if (val) {
                this.classAdd('sk_ui_thinkingBtn_on')
                if (this.lockWhileThinking !== false && this.button) this.button.pointerEvents = 'none'
                this.startWashes()
            } else {
                this.classRemove('sk_ui_thinkingBtn_on')
                if (this.button) this.button.pointerEvents = ''
                this.stopWashes()
            }
        }})

        this.attributes.add({friendlyName: 'Lock While Thinking', name: 'lockWhileThinking', type: 'bool', onSet: val => {
            if (val === false) this.classAdd('sk_ui_thinkingBtn_interactive')
            else this.classRemove('sk_ui_thinkingBtn_interactive')
            if (this.thinking && this.button) {
                this.button.pointerEvents = val === false ? '' : 'none'
            }
        }})
        this.lockWhileThinking = true
    }

    get content(){
        if (this._content) return this._content
        if (this.button && this.button.label) {
            this.button.label.remove()
            this.button.label = undefined
        }
        if (this.button && this.button._icon) {
            this.button._icon.remove()
            this.button._icon = undefined
        }
        this._content = this.button.add.component(_c => {
            _c.classAdd('sk_ui_thinkingBtn_content')
            _c.styling = 'ttb left top fullwidth'
            _c.compact = true
            _c.animate = false
        })
        return this._content
    }

    addWashes(host, opt){
        opt = opt || {}
        for (var i = 0; i < 3; i++) {
            var clip = document.createElement('div')
            clip.className = 'sk_ui_thinkingBtn_wash' + (opt.bright ? ' sk_ui_thinkingBtn_wash_bright' : '')
            clip.setAttribute('aria-hidden', 'true')
            var rotator = document.createElement('div')
            rotator.className = 'sk_ui_thinkingBtn_washRotator'
            var field = document.createElement('div')
            field.className = 'sk_ui_thinkingBtn_washField'
            rotator.appendChild(field)
            clip.appendChild(rotator)
            host.appendChild(clip)
            this._washes.push({rotator: rotator, field: field, bright: !!opt.bright})
        }
    }

    normalizeColors(val){
        if (typeof val === 'string' && sk_ui_thinkingBtn.colormaps[val]) val = sk_ui_thinkingBtn.colormaps[val]
        if (val && Array.isArray(val.stops)) val = val.stops
        if (!Array.isArray(val) || !val.length) val = sk_ui_thinkingBtn.colormaps.iridescence
        return val
    }

    colorToRgba(color, alpha){
        if (Array.isArray(color)) {
            var a = color.length > 3 && Number.isFinite(color[3]) ? color[3] * alpha : alpha
            return 'rgba(' + Math.round(color[0]) + ', ' + Math.round(color[1]) + ', ' + Math.round(color[2]) + ', ' + a + ')'
        }
        var s = String(color == null ? '' : color).trim()
        if (s[0] === '#') {
            var hex = s.slice(1)
            if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
            var n = parseInt(hex, 16)
            if (!Number.isFinite(n)) return 'rgba(8, 190, 255, ' + alpha + ')'
            return 'rgba(' + ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ', ' + alpha + ')'
        }
        var rgb = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
        if (rgb) return 'rgba(' + rgb[1] + ', ' + rgb[2] + ', ' + rgb[3] + ', ' + alpha + ')'
        return s
    }

    gradientFromColors(colors, bright){
        var n = colors.length
        var parts = ['transparent 0%', 'transparent 18%']
        var start = 28
        var end = 72
        for (var i = 0; i < n; i++) {
            var t = n === 1 ? 0.5 : i / (n - 1)
            var pct = start + (end - start) * t
            var edge = Math.min(t, 1 - t) * 2
            var alpha = bright ? (0.75 + 0.25 * edge) : (0.4 + 0.45 * edge)
            parts.push(this.colorToRgba(colors[i], alpha) + ' ' + pct.toFixed(1) + '%')
        }
        parts.push('transparent 82%', 'transparent 100%')
        return 'linear-gradient(90deg, ' + parts.join(', ') + ')'
    }

    applyColors(val){
        var colors = this.normalizeColors(val)
        this._colors = colors
        var n = colors.length
        this._washes.forEach((wash, i) => {
            var offset = n ? i % n : 0
            var rotated = colors.slice(offset).concat(colors.slice(0, offset))
            wash.field.style.background = this.gradientFromColors(rotated, wash.bright)
        })
    }

    startWashes(){
        this.stopWashes()
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        this._washes.forEach((wash, i) => {
            var t = setTimeout(()=> this.playWash(wash), 180 * i + Math.random() * 200)
            this._washTimers.push(t)
        })
    }

    stopWashes(){
        this._washTimers.forEach(clearTimeout)
        this._washTimers = []
        this._washAnims.forEach(anim => {
            try { anim.cancel() } catch (e) {}
        })
        this._washAnims.clear()
    }

    playWash(wash){
        if (!this.thinking) return
        wash.rotator.style.setProperty('--wash-angle', (Math.random() * 360) + 'deg')
        var dir = Math.random() > 0.5 ? 1 : -1
        var span = 85
        var anim = wash.field.animate(
            [
                {transform: 'translateX(' + (-span * dir) + '%)'},
                {transform: 'translateX(' + (span * dir) + '%)'}
            ],
            {duration: 2200 + Math.random() * 1400, easing: 'linear'}
        )
        this._washAnims.set(wash.field, anim)
        anim.finished.then(()=> {
            if (this._washAnims.get(wash.field) !== anim) return
            if (this.thinking) this.playWash(wash)
        }).catch(()=> {})
    }
}

class sk_ui_thinkingBtn_borderOutline extends sk_ui_component {
    constructor(opt){
        super(opt)
        this.multiComponent = true
        this.compact = true
        this.animate = false
        this.pointerEvents = 'none'
        this.classAdd('sk_ui_thinkingBtn_borderOutline')
    }
}

class sk_ui_thinkingBtn_button extends sk_ui_roundedBtn {
    constructor(opt){
        super(opt)
        this.compact = true
        this.animate = false
        this.classAdd('sk_ui_thinkingBtn_btn')
        if (this._icon) this._icon.marginRight = 12
    }
}
