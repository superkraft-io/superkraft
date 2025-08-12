class sk_ui_checkmark extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.currentClasses = {
            loader: 'sk_ui_checkmark_circle-loader',
            loaderComplete: 'sk_ui_checkmark_load-complete',
            check: 'sk_ui_checkmark-check',
            draw: 'sk_ui_checkmark-check-draw',
        }

        var tree = {
            div_loader: { class: 'sk_ui_checkmark_circle-loader',
                div_check: { class: 'sk_ui_checkmark-check sk_ui_checkmark-check-draw' }
            }
        }

        this.checkmarkBucket = JSOM.parse({root: this.element, tree: tree})

        this.style.overflow = 'hidden'

        this.attributes.add({
            friendlyName: 'Size',
            name: 'size',
            type: 'number',
            onSet: val => {
                this.style.minWidth = val
                this.style.minHeight = val

                var loader = this.checkmarkBucket.loader
                var check = this.checkmarkBucket.check

                if (this.currentStyleElement) this.currentStyleElement.remove()

                var style = document.createElement('style')
                style.type = 'text/css'
                style.innerHTML = this.generateCSS(this.uuid, val, val)
                this.currentStyleElement = document.getElementsByTagName('head')[0].appendChild(style)


                loader.classList.remove(this.currentClasses.loader)
                this.currentClasses.loader = 'sk_ui_checkmark_circle-loader-' + this.uuid
                loader.classList.add(this.currentClasses.loader)

                
                check.classList.remove(this.currentClasses.check)
                this.currentClasses.check = 'sk_ui_checkmark-check-' + this.uuid
                check.classList.add(this.currentClasses.check)

                check.classList.remove(this.currentClasses.draw)
                this.currentClasses.draw = 'sk_ui_checkmark-check-draw-' + this.uuid
                check.classList.add(this.currentClasses.draw)

                if (this.checked)  loader.classList.remove(this.currentClasses.loaderComplete)
                this.currentClasses.loaderComplete = 'sk_ui_checkmark_load-complete-' + this.uuid
                if (this.checked) loader.classList.add(this.currentClasses.loaderComplete)
            }
        })

        this.attributes.add({
            friendlyName: 'Color',
            name: 'color',
            type: 'string',
            onSet: val => {
                var loader = this.checkmarkBucket.loader
                var check = this.checkmarkBucket.check

                loader.style.borderLeftColor = val

                if (this.isChecked){
                    loader.style.borderColor = val
                    check.syle.borderLeftColor = val
                }
            }
        })

        this.size = 100
    }

    async check(){
        this.checked = true
        
        //this.checkmarkBucket.loader.style.borderColor      = this.__color
        //this.checkmarkBucket.check.style.borderRightColor  = this.__color
        //this.checkmarkBucket.check.style.borderTopColor    = this.__color

        this.checkmarkBucket.loader.classList.add(this.currentClasses.loaderComplete)
        this.checkmarkBucket.check.style.opacity = 1
        this.checkmarkBucket.check.transition('scale in')
        this.isChecked = true
        await sk.utils.sleep(250)
    }

    generateCSS(id, width, height){
        var css =  `        
        .sk_ui_checkmark_circle-loader-<id> {
            border: <borderThickness>px solid rgba(0, 0, 0, 0.2);
            border-left-color: #5cb85c;
            animation: sk_ui_checkmark_loader-spin-<id> 1.2s infinite linear;
            position: relative;
            display: inline-block;
            vertical-align: top;
            border-radius: 50%;
            min-width: <height>px;
            min-height: <height>px;
        }
         
        .sk_ui_checkmark-check-<id> {
            opacity: 0;
            display: none;
            position: absolute;
        }
        
        .sk_ui_checkmark_load-complete-<id> {
            -webkit-animation: none !important;
            animation: none !important;
            border-color: #5cb85c !important;
            transition: border 200ms ease-out;
        }
         
        .sk_ui_checkmark-check-<id>.sk_ui_checkmark-check-draw-<id>:after {
            animation-duration: 800ms;
            animation-timing-function: ease;
            animation-name: sk_ui_checkmark-check-<id>;
            transform: scaleX(-1) rotate(135deg);
        }
        .sk_ui_checkmark-check-<id>:after {
            opacity: 1;
            height: <checkHeight>px;
            width: <checkWidth>px;
            transform-origin: left top;
            border-right: <borderThickness>px solid #5cb85c;
            border-top: <borderThickness>px solid #5cb85c;
            content: '';
            left: <checkLeft>px;
            top: <checkTop>px;
            position: absolute;
        }
        
        @keyframes sk_ui_checkmark_loader-spin-<id> {
            0% {
                transform: rotate(0deg);
            }
                100% {
                transform: rotate(360deg);
            }
        }
        
        @keyframes sk_ui_checkmark-check-<id> {
            0% {
                height: 0;
                width: 0;
                opacity: 1;
            }
                20% {
                height: 0;
                width: <checkWidth>px;
                opacity: 1;
            }
                40% {
                height: <checkHeight>px;
                width: <checkWidth>px;
                opacity: 1;
            }
                100% {
                height: <checkHeight>px;
                width: <checkWidth>px;
                opacity: 1;
            }
        }
        `

        var widthRatio = (height/100)
        var heightRatio = (height/100)

        var widthSub = (1*(1-widthRatio))
        var heightSub = (1*(1-heightRatio))

        var checkInfo = {
            pos: {x: 18 * (width/100) - widthSub, y: 50 * (height/100) - heightSub},
            size: {width: width/4, height: height/2}
        }

        var borderThickness = 5 * (width/100)
        if (borderThickness < 2) borderThickness = 2

        var adaptedCSS = css
        .split('<id>')          .join(id)
        .split('<width>')       .join(width)
        .split('<height>')      .join(height)
        
        .split('<checkWidth>')  .join(checkInfo.size.width)
        .split('<checkHeight>') .join(checkInfo.size.height)
        .split('<checkLeft>')   .join(checkInfo.pos.x)
        .split('<checkTop>')    .join(checkInfo.pos.y)

        .split('<borderThickness>').join(borderThickness)

        return adaptedCSS

    }
}