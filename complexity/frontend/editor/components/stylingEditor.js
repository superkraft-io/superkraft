class ss_ui_complexity_stylingEditor extends ss_ui_groupCollapsable {
    constructor(opt){
        super(opt)
        this.collapsable = true
        this.container.styling = 'ttb center middle'

        this.header = 'Styling'

        var newToggleButton = (parent, icon, hint, cb)=>{
            return parent.add.button(_c => {
                _c.icon = icon
                _c.type = 'icon'
                _c.toggle = true
                _c.hint(hint, 'bottom center')
                _c.onClick = ()=>{ this.apply() }
                if (cb) cb(_c)
            })
        }
        
        this.styling = 'ttb'


        

        this.alignments = {}

        this.container.add.component(_c => {
            this.map = _c.add.component(_c => {
                _c.styling = 'ttb'
                _c.style.border = 'solid 1px grey'
                _c.style.borderRadius = '8px'
                _c.style.overflow = 'hidden'

                _c.deselectAll = ()=>{
                    _c.children.forEach(row => {
                        row.children.forEach(slot => {
                            slot.toggled = false
                        })
                    })
                }

                function createRow(parent, rowName){
                    parent.add.component(row => {
                        row.pos = rowName
                        
                        row.left = row.add.button(_c => {
                            _c.pos = 'left'
                            row.parent[row.pos + ' ' + _c.pos] = _c
                            _c.icon = 'angle left'
                            if (row.pos === 'top')_c._icon.style.transform = 'rotate(45deg)'
                            else if (row.pos === 'bottom') _c._icon.style.transform = 'rotate(-45deg)'

                            _c.hint(row.pos + ' ' + _c.pos, 'bottom center')
                        })

                        row.center = row.add.button(_c => {
                            _c.pos = 'center'
                            row.parent[row.pos + ' ' + _c.pos] = _c
                            if (row.pos === 'top') _c.icon = 'angle up'
                            else if (row.pos === 'middle') _c.icon = 'dot circle outline'
                            else if (row.pos === 'bottom') _c.icon = 'angle down'

                            _c.hint(row.pos + ' ' + _c.pos, 'bottom center')
                        })

                        row.right  = row.add.button(_c => {
                            _c.pos = 'right'
                            row.parent[row.pos + ' ' + _c.pos] = _c
                            _c.icon = 'angle right'
                            if (row.pos === 'top') _c._icon.style.transform = 'rotate(-45deg)'
                            else if (row.pos === 'bottom') _c._icon.style.transform = 'rotate(45deg)'

                            _c.hint(row.pos + ' ' + _c.pos, 'bottom center')
                        })
                        
                    })
                }

                _c.top = createRow(_c, 'top')
                _c.middle = createRow(_c, 'middle')
                _c.bottom = createRow(_c, 'bottom')


                _c.children.forEach(row => {
                    row.children.forEach(slot => {
                        slot.type = 'icon'
                        slot.toggle = true
                        slot.onClick = ()=>{
                            this.map.deselectAll()
                            this.alignments.hor_ver = row.pos + ' ' + slot.pos
                            this.apply()
                        }
                    })
                })
            })

            _c.add.component(_c => {
                _c.styling = 'ttb'
                this.alignments.fill = newToggleButton(_c, 'expand arrows alternate', 'Fill')
                this.alignments.ttb = newToggleButton(_c, 'sort amount down', 'Top-to-Bottom')
                this.alignments.btt = newToggleButton(_c, 'sort amount up', 'Bottom-to-Top')
            })
        })

        this.container.add.component(_c => {
            _c.styling = 'ttb'

            _c.add.component(_c => {
                _c.styling = 'ttb'

                _c.add.component(_c => {
                        _c.styling += ' fullwidth'

                    this.alignments.sb = newToggleButton(_c, 'th large', 'Space Between', _c => { _c._icon.size = 9.5})
                    this.alignments.sa = newToggleButton(_c, 'expand', 'Space Around')
                    this.alignments.se = newToggleButton(_c, 'ellipsis horizontal', 'Space Evenly')
                })

                _c.add.component(_c => {
                    _c.styling += ' fullwidth'
                    
                    this.alignments.fullwidth = newToggleButton(_c, 'arrows alternate horizontal', 'Full Width')
                    this.alignments.fullheight = newToggleButton(_c, 'arrows alternate vertical', 'Full Height')
                    this.alignments.scrollable = newToggleButton(_c, 'mouse', 'Scrollable')
                })
            })
        })
        
               
    }

    updateFromSelection(objects){
        this.map.deselectAll()

        this.objects = objects

        var alignments = this.alignments
        for (var i in alignments){
            var alignment = alignments[i]
            try { alignment.toggled = false }catch(err){}
        }

        


        objects.forEach(object => {
            var styling = object.styling || ''
            var stylingArr = styling.split(' ')
            var row = 'middle'
            var slot = 'center'
            
            for (var i in stylingArr){
                var alignment = stylingArr[i]

                try { alignments[alignment].toggled = false }catch(err){}

                if (alignment === 'top' || alignment === 'middle' || alignment === 'bottom') row = alignment
                else
                if (alignment === 'left' || alignment === 'center' || alignment === 'right') slot = alignment
                else {
                    try { alignments[alignment].toggled = true } catch(err) {}
                }
            }
            try {
                alignments.hor_ver = row + ' ' + slot
                this.map[alignments.hor_ver].toggled = true
                
            } catch(err) {}
        })
    }

    apply(){
        this.objects.forEach(object => {
            object.classAdd('ss_ui_complexity_object_edited')

            var alignments = this.alignments

            this.map[alignments.hor_ver].toggled = true

            var stylingArr = [alignments.hor_ver]
            
            for (var _al in alignments){
                if (alignments[_al].toggled) stylingArr.push(_al)
            }
            /*if (alignments.fill.toggled) stylingArr.push('fill')
            if (alignments.ttb.toggled) stylingArr.push('ttb')
            if (alignments.btt.toggled) stylingArr.push('btt')
            if (alignments.sb.toggled) stylingArr.push('sb')
            if (alignments.sa.toggled) stylingArr.push('sa')
            if (alignments.se.toggled) stylingArr.push('se')
            if (alignments.fullwidth.toggled) stylingArr.push('fullwidth')
            if (alignments.fullheight.toggled) stylingArr.push('fullheight')
            if (alignments.scrollable.toggled) stylingArr.push('scrollable')*/

            object.styling = stylingArr.join(' ')
        })
    }
}