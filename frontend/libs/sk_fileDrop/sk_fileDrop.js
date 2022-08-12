class sk_fileDrop {
    constructor(){
    
        this.subscribers = {}

        var elementToHandle = document.body
        if (sk.app_type === 'dapp') elementToHandle = document

        elementToHandle.addEventListener('dragover', _e => {
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

        this.files = undefined
        elementToHandle.addEventListener('drop',_e => {
            this.files = _e.dataTransfer.files
            endDragDropEvent(_e, 'drop')
        }, false)
    }

    subscribe(component){ this.subscribers[component.uuid] = component }
    unsubscribe(component){ delete this.subscribers[component.uuid] }

    
    notifyAll(_e, action){
        var findFirstSubscriberOccurance = (path, uuid) => {
            for (var i in path){
                var el = path[i]
                if (el.sk_ui_obj && el.sk_ui_obj.uuid === uuid) return el.sk_ui_obj
            }
        }

        for (var uuid in this.subscribers){
            var component = this.subscribers[uuid]

            if (action === 'start') this.addFileDropArea(component)
            if (action === 'end' || action === 'drop') this.removeFileDropArea(component)

            if (action === 'drop') {
                var target = findFirstSubscriberOccurance(_e.path, component.uuid)
                if (component.onFileDrop && target) target.onFileDrop(this.files)
            }
        }
        
        if (action === 'start') this.startOutlineAnimation()
        if (action === 'end' || action === 'drop') this.stopOutlineAnimation()
    }

    addFileDropArea(component){
        component.fileDropArea = component.add.fileDrop_Area(_c => {
            _c.outline.style.borderRadius = window.getComputedStyle(component.element, null).getPropertyValue('border-radius')
        })
    }

    removeFileDropArea(component){
        component.fileDropArea.remove()
    }

    startOutlineAnimation(){
        var stepping = 0.05
        var min = 0.2
        var max = 1

        this.outlineOpacity = 0
        this.outlineAnimatorReverse = false
        
        var firstRun = true

        clearInterval(this.outlineAnimatorTimer)
        this.outlineAnimatorTimer = setInterval(()=>{
            this.outlineOpacity = (this.outlineAnimatorReverse ? this.outlineOpacity-stepping : this.outlineOpacity+stepping)
            for (var i in this.subscribers) this.subscribers[i].fileDropArea.outline.style.borderColor = `rgba(255,255,255,${this.outlineOpacity})`
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