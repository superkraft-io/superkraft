class sk_ui_gradient_element extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.bgContainer = this.add.component(_c => {
            _c.classAdd('sk_ui_gradient_element_bgContainer')
            _c.add.component(_c => {
                _c.styling += ' fullwidth fullheight'
                _c.classAdd('sk_ui_gradient_default')
            })
        })

        var observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                var rect = entry.contentRect

                var biggestSide = rect.width
                if (rect.height > biggestSide) biggestSide = rect.height
                biggestSide *= 1.5
                
                this.bgContainer.style.width = biggestSide + 'px'
                this.bgContainer.style.height = biggestSide + 'px'
            }
        })
        observer.observe(this.element)
    }
}