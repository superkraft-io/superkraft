class sk_ui_led extends sk_ui_button {
    constructor(opt) {
        super(opt)

        this._icon.remove()
        this.label.remove()

        this.compact = true

        this.glow = this.add.component(_c => {
            _c.classAdd('sk_ui_led_glow')
        })
    }

    set active(val) {
        this.__led_state = val
        if (val) {
            this.classAdd('sk_ui_led_on')
        } else {
            this.classRemove('sk_ui_led_on')

        }

        
    }

    get active() { return this.__led_state }

    asImg(opt) {
        this.__asImg = true

        this.offImg = this.add.image(_c => {
            _c.classAdd('sk_ui_led_asImg sk_ui_led_asImg_off')
            _c.url = opt.offImgUrl
            _c.size = 16
        })

        this.onImg = this.add.image(_c => {
            _c.classAdd('sk_ui_led_asImg sk_ui_led_asImg_on')
            _c.url = opt.onImgUrl
            _c.size = 16
        })

        if (opt.color) this.color = opt.color

        const resizeObserver = new ResizeObserver((entries) => {
            this.offImg.size = this.rect.width
            this.onImg.size = this.rect.width
        })

        resizeObserver.observe(this.element)
    }

    set color(val) {
        var filters = {
            red     : { filter: ''                  , color: 'red'},
            green   : { filter: 'hue-rotate(100deg)', color: 'green' },
            blue    : { filter: 'hue-rotate(200deg)', color: '#0072ff' },
            yellow  : { filter: 'hue-rotate(62deg)' , color: 'yellow' },
            orange  : { filter: 'hue-rotate(42deg)' , color: 'orange' },
            pink    : { filter: 'hue-rotate(300deg)', color: '#ff00c8' },
            purple  : { filter: 'hue-rotate(275deg)', color: '#aa22ff' },

            white   : { filter: {off: 'brightness(2) grayscale(1)', on: 'grayscale(1)'}, color: 'white' }
        }

        this.glow.backgroundColor = filters[val].color
        this.offImg.style.filter  = (filters[val].filter.off ? filters[val].filter.off : filters[val].filter)
        this.onImg.style.filter   = (filters[val].filter.on ? filters[val].filter.on : filters[val].filter)
    }
}