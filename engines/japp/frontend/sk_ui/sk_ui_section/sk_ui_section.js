class sk_ui_section extends sk_ui_component {
    constructor(opt) {
        super(opt)

        this.compact = true

        this.top = this.add.component(_c => {
            _c.classAdd('sk_ui_section_top')

            _c.styling += ' fullwidth'

            _c.vertical = false
            _c.compact = true

            _c.leftSide = _c.add.component(_c => {
                _c.styling += ' fullheight'

                _c.vertical = false
                _c.compact = true

                this.titleContainer = _c.add.component(_c => {
                    _c.classAdd('sk_ui_section_titleContainer')

                    this.titleLabel = _c.add.label(_c => {
                        _c.classAdd('sk_ui_section_title')
                        _c.text = 'Section'
                        _c.weight = 300
                    })

                    
                })

                this.titleContainerWing = _c.add.component(_c => {
                    _c.classAdd('sk_ui_section_title_wing')
                })
                
            })

            _c.middle = _c.add.component(_c => {
                _c.styling += ' fill fullheight'
            })

            _c.rightSide = _c.add.component(_c => {
                _c.styling += ' fullheight'
                _c.padding = 2
            })
        })

        this.middle = this.add.component(_c => {
            _c.styling += ' fullwidth fullheight'

            _c.compact = true

            _c.top = _c.add.component(_c => {
                _c.styling += ' fullwidth'

            })

            _c.middle = _c.add.component(_c => {
                _c.styling += ' fullheight fullwidth'
            })

            _c.bottom = _c.add.component(_c => {
                _c.styling += ' fullwidth'
            })
        })

        this.bottom = this.add.component(_c => {
            _c.styling += ' fullwidth'

            _c.vertical = false
            _c.compact = true
        })

        this.titleSize = 14
    }

    set title(val) {
        this.titleLabel.text = val
    }

    set titleSize(val) {
        var newSize = Math.round(val * 2)
        this.top.height = newSize
        this.titleLabel.size = val
        this.titleContainer.height = newSize
        this.titleContainerWing.width = Math.round(newSize * 1.5)
        this.titleContainerWing.height = newSize
    }
}