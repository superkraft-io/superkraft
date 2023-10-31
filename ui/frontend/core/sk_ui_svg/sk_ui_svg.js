class sk_ui_svg extends sk_ui_component {
    constructor(opt){
        super({...opt, ...{htmlTag: 'svg'}})

        this.styling = ''
        this.compact = true

        this.def = document.createElement('g')
        this.element.appendChild(this.def)


        this.shapes = []

        this.add = {
            text: cb => {
                var shape = new sk_ui_svg_shape_text({parent: this.def, shape: 'text'})
                if (cb) cb(shape)
                return shape
            },

            rectangle: cb => {
                var shape = new sk_ui_svg_shape_circle({parent: this.def, shape: 'rectangle'})
                if (cb) cb(shape)
                return shape
            },

            circle: cb => {
                var shape = new sk_ui_svg_shape_circle({parent: this.def, shape: 'circle'})
                if (cb) cb(shape)
                return shape
            },

            polygon: cb => {
                var shape = new sk_ui_svg_shape_polygon({parent: this.def, shape: 'polyline'})
                this.shapes.push(shape)
                shape.points = opt.points
                if (cb) cb(shape)
                return shape
            },
        }
    }
}

class sk_ui_svg_shape {
    constructor(opt){
        this.element = document.createElement(opt.shape)
        opt.parent.appendChild(this.element)
    }

    set left(val){
        this.element.setAttribute('x', val)
    }
    
    set top(val){
        this.element.setAttribute('y', val)
    }
}


class sk_ui_svg_shape_text extends sk_ui_svg_shape {
    set text(val){ this.element.innerHTML = val }
    set family(val){ this.element.setAttribute('font-family', val) }
    set weight(val){ this.element.setAttribute('font-weight', val) }
    set size(val){ this.element.setAttribute('font-size', val) }
    
}

class sk_ui_svg_shape_rectangle extends sk_ui_svg_shape {
    
}

class sk_ui_svg_shape_circle extends sk_ui_svg_shape {
    set left(val){
        this.element.setAttribute('cx', val)
    }
    
    set top(val){
        this.element.setAttribute('cy', val)
    }

    set radius(val){
        this.element.setAttribute('r', val)
    }
}

class sk_ui_svg_shape_polygon extends sk_ui_svg_shape {
    set points(val){
        var svg_points = []

        for (var i in val){
            var point = val[i]
            svg_points.push(point.x + ',' + point.y)
        }

        this.element.setAttribute('points', svg_points.join(' '))
    }
}