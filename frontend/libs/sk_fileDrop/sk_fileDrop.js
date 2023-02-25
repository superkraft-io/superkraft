class sk_fileDrop {
    constructor(){
    
        this.files = undefined
        this.subscribers = {}

        var elementToHandle = document.body
        if (sk.app_type === 'dapp') elementToHandle = document

        elementToHandle.addEventListener('dragover', _e => {
            _e.dataTransfer.effectAllowed = "move";
            _e.preventDefault()
            _e.stopPropagation()

            clearTimeout(this.endTimer)

            if (this.dragging) return

            this.dragging = true
            this.notifyAll(_e, 'start')

            //return false;
        })



        var endDragDropEvent = (_e, event) => {
            clearTimeout(this.endTimer)
            this.endTimer = setTimeout(()=>{
                this.notifyAll(_e, event)
                this.dragging = false
            }, 100)

            _e.preventDefault()
            _e.stopPropagation()
        }

        elementToHandle.addEventListener('dragleave', _e => {
            endDragDropEvent(_e, 'end')
        })

        elementToHandle.addEventListener('drop',_e => {
            var dt = _e.dataTransfer
            this.files = dt.files
            _e.files = this.files
            endDragDropEvent(_e, 'drop')
        }, false)
    }

    subscribe(component){ this.subscribers[component.uuid] = component }
    unsubscribe(component){ delete this.subscribers[component.uuid] }

    
    findFirstSubscriberOccurance(path, uuid){
        for (var i in path){
            var el = path[i]
            if (el.sk_ui_obj && el.sk_ui_obj.uuid === uuid) return el.sk_ui_obj
        }
    }

    notifyAll(_e, action){
        for (var uuid in this.subscribers){
            var component = this.subscribers[uuid]
            if (!component.onFileDrop) return

            if (action === 'start') this.addFileDropArea(component)
            if (action === 'end' || action === 'drop') this.removeFileDropArea(component, _e)
            if (action === 'drop') {   
                var path = _e.target.sk_ui_obj.getPath({elements: true})
                var target = this.findFirstSubscriberOccurance(path, component.uuid)             
                if (target && target.onFileDrop) target.onFileDrop.cb({action: 'drop', files: this.files})
            }
        }
        
        if (action === 'start') this.startOutlineAnimation()
        if (action === 'end' || action === 'drop') this.stopOutlineAnimation()
    }


    overFunc(_e){
        var posChanged = (a,b)=>{
            var pA = {
                x: (a.clientX || a.touches[0].clientX),
                y: (a.clientY || a.touches[0].clientY)
            }

            var pB = {
                x: (b.clientX || b.touches[0].clientX),
                y: (b.clientY || b.touches[0].clientY)
            }

            if (pA.x !== pB.x || pA.y !== pB.y) return true
        }

        var path = _e.target.sk_ui_obj.getPath({elements: true})
        for (var i in path){
            var item = path[i]
            var suo = item.sk_ui_obj
            if (!suo) continue
            if (!suo.onFileDrop) continue

            if (posChanged(_e, suo.__dragOverInfo)){
                suo.__dragOverInfo = _e
                if (suo.onMouseMove) suo.onMouseMove(_e)
            }

            if (suo.fileDropStartNotified) continue
            suo.fileDropStartNotified = true
            suo.fileDropEndNotified = true
            suo.element.addEventListener('dragleave', sk.fileDrop.leaveFunc)
            suo.onFileDrop.cb({action: 'start', files: sk.fileDrop.files})
            if (suo.onMouseEnter) suo.onMouseEnter(_e)

            return
        }
    }
    
    leaveFunc(_e){
        var path = _e.target.sk_ui_obj.getPath({elements: true})
        for (var i in path){
            var item = path[i]
            var suo = item.sk_ui_obj
            if (!suo) continue
            if (!suo.onFileDrop) continue
            suo.onFileDrop.cb({action: 'end', files: sk.fileDrop.files})
            suo.element.removeEventListener('dragleave', sk.fileDrop.leaveFunc)
            delete suo.fileDropStartNotified
            if (suo.onMouseLeave) suo.onMouseLeave(_e)
            return
        }
    }

    addFileDropArea(component){
        component.__dragOverInfo = {clientX: 1, clientY: 1}
        component.element.addEventListener('dragover', this.overFunc)
        component.fileDropArea = component.add.fileDrop_Area(_c => {
            _c.outline.style.borderRadius = window.getComputedStyle(component.element, null).getPropertyValue('border-radius')
        })
    }

    removeFileDropArea(component, _e){
        component.element.removeEventListener('dragover', this.overFunc)
        component.fileDropArea.remove()

        if (_e.type === 'drop'){
            var path = _e.target.sk_ui_obj.getPath({elements: true})
            var target = this.findFirstSubscriberOccurance(path, component.uuid)
            if (target && target.onMouseUp) target.onMouseUp(_e)
        }
    }

    startOutlineAnimation(){
        var stepping = 0.05
        var min = 0.2
        var max = 1

        this.outlineOpacity = 0
        this.outlineAnimatorReverse = false
        
        var firstRun = true

        for (var i in this.subscribers){
            if (this.subscribers[i].onFileDrop.hidden){
                this.subscribers[i].fileDropArea.outline.style.borderColor = 'transparent'
                continue
            }
        }

        clearInterval(this.outlineAnimatorTimer)
        this.outlineAnimatorTimer = setInterval(()=>{
            this.outlineOpacity = (this.outlineAnimatorReverse ? this.outlineOpacity-stepping : this.outlineOpacity+stepping)
            for (var i in this.subscribers){
                if (this.subscribers[i].onFileDrop.hidden) continue
                this.subscribers[i].fileDropArea.outline.style.borderColor = `rgba(255,255,255,${this.outlineOpacity})`
            }
            if (!firstRun && this.outlineOpacity < min){
                this.outlineAnimatorReverse = false
                this.outlineOpacity = min
            }
            
            if (this.outlineOpacity > max){
                this.outlineAnimatorReverse = true
                this.outlineOpacity = max
                firstRun = false
                stepping = 0.01
            }
        }, 10)
    }

    stopOutlineAnimation(){
        clearInterval(this.outlineAnimatorTimer)
    }
}