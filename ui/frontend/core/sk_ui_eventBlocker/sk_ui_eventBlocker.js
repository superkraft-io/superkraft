class sk_ui_eventBlocker extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.style.display = 'none'
        
        this.senders = {}


        var _this = this

        this.onEnter = _e => {
    
            var sender = this.findSenderInPath(_e)
            if (!sender) return this.style.cursor = ''
            
            if (sk.cursors[sender.cursor] || sender.cursor === '_') return this.style.cursor = 'none'

            this.style.cursor = sender.cursor
        }
    
        this.onLeave = _e => {
            this.style.cursor = ''
        }
    
        this.onMove = _e => {
        }



        this.element.addEventListener('mouseenter', this.onEnter)
        this.element.addEventListener('mouseleave', this.onLeave)
        this.element.addEventListener('mousemove', this.onMove)
    }

    setCursorFor(_c){
        this.senders[_c.uuid] = _c
    }

    removeCursorFor(_c){
        delete this.senders[_c.uuid]
    }

    findSenderInPath(_e){
        var suo = _e.fromElement.sk_ui_obj

        
        var list = suo.getPath({elements: true})
        
        for (var i in list){
            var el = list[i]
            var sender = this.senders[el.id]
            if (!sender) continue
            return sender
        }
    }
}