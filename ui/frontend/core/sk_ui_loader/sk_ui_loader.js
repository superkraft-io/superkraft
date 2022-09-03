class sk_ui_loader extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)

        this.classAdd('ui active cetered inline loader')

        this.styling = 'left'

        this.sk_attributes.add({friendlyName: 'Speed', name: 'speed', type: 'text', onSet: val => {
            this.classRemove('slow fast')
            this.classAdd(val)
        }})

        this.sk_attributes.add({friendlyName: 'Color', name: 'color', type: 'text', onSet: val => {
            this.classRemove('primary secondary red orange yellow olive green teal blue violet purple pink brown grey black')
            this.classAdd(val)
        }})

        this.sk_attributes.add({friendlyName: 'Size', name: 'size', type: 'number', onSet: val => {
            //this.classRemove('mini tiny small medium large big huge massive')

            /*var sizes = {
                undefined: 32,
                mini    : 14,
                tiny    : 16,
                small   : ,
                medium  : ,
                large   : ,
                big     : ,
                huge    : ,
                massive :
            }*/

            if (this.currentStyleElement) this.currentStyleElement.remove()

            var style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = this.generateCSS(this.uuid, val, val)
            this.currentStyleElement = document.getElementsByTagName('head')[0].appendChild(style)

            this.classRemove(this.currentClass)
            this.currentClass = 'loader_' + this.uuid
            this.classAdd(this.currentClass)
        }})

        this.sk_attributes.add({friendlyName: 'Inverted', name: 'inverted', type: 'bool', onSet: val => {
            this.classRemove('inverted')
            if (val) this.classAdd('inverted')
        }})

        this.sk_attributes.add({friendlyName: 'Indeterminate', name: 'indeterminate', type: 'bool', onSet: val => {
            this.classRemove('indeterminate')
            if (val) this.classAdd('indeterminate')
        }})

        this.sk_attributes.add({friendlyName: 'Double', name: 'double', type: 'bool', onSet: val => {
            this.classRemove('double')
            if (val) this.classAdd('double')
        }})

        this.sk_attributes.add({friendlyName: 'Elastic', name: 'elastic', type: 'bool', onSet: val => {
            this.classRemove('elastic')
            if (val) this.classAdd('elastic')
        }})
    }


    generateCSS(id, width, height){
        var css =  `
        .ui.loader_<id> {
            width: <width>px !important;
            height: <height>px !important;
            font-size: <widtht>px;
        }


        .ui.loader_<id>:before {
            width: <width>px !important;
            height: <height>px !important;
            margin: 0 0 0 -<offset>px !important;
            border: <thickness>px solid rgba(0, 0, 0, 0.1) !important;
        }

        .ui.loader_<id>:after {
            width: <width>px !important;
            height: <height>px !important;
            margin: 0 0 0 -<offset>px !important;
            /*border: <thickness>px solid #767676 !important;*/
        }
        `

        var borderThickness = (width/32)
        if (borderThickness < 2) borderThickness = 2

        var adaptedCSS = css
        .split('<id>')          .join(id)
        .split('<width>')       .join(width)
        .split('<height>')      .join(height)
        .split('<offset>')      .join(width/2)
        .split('<thickness>')   .join(borderThickness)

        return adaptedCSS

    }
}