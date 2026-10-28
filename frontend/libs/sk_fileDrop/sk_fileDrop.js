class sk_fileDrop {
    constructor(){
    
        this.files = undefined
        this.subscribers = {}
        this.active = new Set()     // the subscribers in drop mode for the drag going on

        // A drag the app started itself (a file dragged out with webContents.startDrag): only
        // subscribers with onFileDrop.internal go into drop mode. Set by whoever starts it, cleared
        // on its drop or the first mouse move after it (a drop outside the app fires nothing here).
        this.internal = false

        var elementToHandle = document.body
        if (sk.app_type !== 'wapp') elementToHandle = document

        elementToHandle.addEventListener('dragover', _e => {
            if (this.bypass) return
            if (!_e.dataTransfer.types.includes('Files')) return

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
            if (this.bypass) return
            endDragDropEvent(_e, 'end')
        })

        elementToHandle.addEventListener('drop', async _e => {
            if (this.bypass) return;

            _e.preventDefault();

            const dt = _e.dataTransfer;

            if (dt.files.length > 0){
                this.files = dt.files
            } else {
                this.files = []

                if (dt.items) {
                    for (const item of dt.items) {
                        if (item.kind === 'file') {
                            if ('getAsFileSystemHandle' in item) {
                                // Modern File System Access API
                                const handle = await item.getAsFileSystemHandle();
                                await this.processHandle(handle, this.files);
                            } else if ('webkitGetAsEntry' in item) {
                                // Older Chrome/Safari API
                                const entry = item.webkitGetAsEntry();
                                await this.processEntry(entry, this.files);
                            } else {
                                // Fallback: plain file
                                const file = item.getAsFile();
                                this.list.push(file)
                                //console.log(`File: ${file.name}`);
                            }
                        }
                    }
                }
            }

            var filesArray = []

            if (sk.app_type === 'dapp'){
                const { webUtils } = require('electron');

                for (var i = 0; i < this.files.length; i++){
                    try {
                        filesArray.push({
                            name: this.files[i].name,
                            size: this.files[i].size,
                            type: this.files[i].type,
                            lastModified: this.files[i].lastModified,
                            path: webUtils.getPathForFile(this.files[i])
                        })
                    } catch(err){
                        var x = 0
                    }
                }

                _e.files = filesArray; 
            } else {
                 for (var i = 0; i < this.files.length; i++){
                    filesArray.push(this.files[i])
                }
                
                _e.files = filesArray; 
            }

           
            
            endDragDropEvent(_e, 'drop');
        }, false);
    }

    async processHandle(handle, list) {
        if (handle.kind === 'file') {
            const file = await handle.getFile();
            list.push(file)
        } else if (handle.kind === 'directory') {
            for await (const entry of handle.values()) {
                await this.processHandle(entry, list); // recursion
            }
        }
    }

    async processEntry(entry, list) {
        if (entry.isFile) {
            entry.file(file => {
                list.push(file)
            });
        } else if (entry.isDirectory) {
            const reader = entry.createReader();
            const readEntries = async () => {
                const entries = await new Promise(resolve => reader.readEntries(resolve));
                for (const subEntry of entries) {
                    await this.processEntry(subEntry, list);
                }
                if (entries.length > 0) {
                    await readEntries();
                }
            };
            await readEntries();
        }
    }





    // The components from the event's target up (its nearest element that is one: a drop on a label's
    // text or an image inside a component lands on an element that isn't, and getPath on it threw,
    // leaving every drop area after it in place).
    pathOf(_e){
        var el = _e && _e.target
        while (el && !el.sk_ui_obj) el = el.parentElement
        return el ? el.sk_ui_obj.getPath({elements: true}) : []
    }

    subscribe(component){ this.subscribers[component.uuid] = component }
    unsubscribe(component){ delete this.subscribers[component.uuid] }

    
    findFirstSubscriberOccurance(path, uuid){
        for (var i in path){
            var el = path[i]
            if (el.sk_ui_obj && el.sk_ui_obj.uuid === uuid) return el.sk_ui_obj
        }   
    }

    // Whether a subscriber goes into drop mode for this drag (onFileDrop.accepts: a test of its own).
    accepts(component){
        var opt = component.onFileDrop
        if (!opt) return false
        if (this.internal && !opt.internal) return false
        return !opt.accepts || !!opt.accepts()
    }

    startInternal(){
        this.internal = true
    }

    endInternal(){
        this.internal = false
    }

    notifyAll(_e, action){
        if (action === 'start') this.active = new Set(Object.values(this.subscribers).filter(component => this.accepts(component)))
        var active = this.active
        if (action === 'end' || action === 'drop') this.active = new Set()
        if (action === 'drop') this.internal = false

        // CSS hooks: the page while a drag is on, and the subscribers that take it (others can fade).
        if (action === 'start') document.body.classList.add('sk_fileDrop_dragging')
        if (action === 'end' || action === 'drop') document.body.classList.remove('sk_fileDrop_dragging')

        var path = (action === 'drop') ? this.pathOf(_e) : []
        for (var component of active){
            if (!component.onFileDrop) continue

            // (One subscriber's failure leaves the others' drop areas to be cleaned up all the same.)
            try {
                if (action === 'start') component.element.classList.add('sk_fileDrop_accepting')
                if (action === 'end' || action === 'drop') component.element.classList.remove('sk_fileDrop_accepting')

                if (action === 'start') this.addFileDropArea(component)
                if (action === 'end' || action === 'drop') this.removeFileDropArea(component, _e, path)
                if (action === 'drop') {
                    var target = this.findFirstSubscriberOccurance(path, component.uuid)
                    if (target && target.onFileDrop) target.onFileDrop.cb({action: 'drop', files: _e.files})
                }
            } catch(err) {
                console.error('sk_fileDrop:', err)
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

        var path = sk.fileDrop.pathOf(_e)
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
            suo.onFileDrop.cb({action: 'start', files: _e.dataTransfer.files, items: _e.dataTransfer.items})
            if (suo.onMouseEnter) suo.onMouseEnter(_e)

            return
        }
    }
    
    leaveFunc(_e){
        var path = sk.fileDrop.pathOf(_e)
        if (!path.length) return

        var listUpUntilFileDropArea = []
        for (var i in path){
            var item = path[i]
            var suo = item.sk_ui_obj

            listUpUntilFileDropArea.push(item)
            
            if (suo.onFileDrop) break
        }


        var lastItem = listUpUntilFileDropArea[listUpUntilFileDropArea.length-1]
        if (lastItem.id !== _e.target.id) return

        var shouldNotifyLeave = false

        for (var i in listUpUntilFileDropArea){
            var item = listUpUntilFileDropArea[i]

            var ponterEvents = window.getComputedStyle(suo.element, 'pointer-events').pointerEvents
            if (ponterEvents === 'none') return

            shouldNotifyLeave = true
            break
        }

        var suo = lastItem.sk_ui_obj
        suo.onFileDrop.cb({action: 'end', files: sk.fileDrop.files})
        suo.element.removeEventListener('dragleave', sk.fileDrop.leaveFunc)
        delete suo.fileDropStartNotified
        if (suo.onMouseLeave) suo.onMouseLeave(_e)

        return


            
        //old
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
        var parentPostionCSSValue = sk.utils.cssVar('position', component)

        if (component.fileDropArea) component.fileDropArea.remove()     // (one left over: never two)
        component.__dragOverInfo = {clientX: 1, clientY: 1}
        component.element.addEventListener('dragover', this.overFunc)
        component.fileDropArea = component.add.fileDrop_Area(_c => {
            _c.outline.style.borderRadius = window.getComputedStyle(component.element, null).getPropertyValue('border-radius')
            
            if (!['relative', 'absolute'].includes(parentPostionCSSValue)){
                _c.add.text(_c => {
                    _c.style.position = 'absolute'
                    _c.style.width = '100%'
                    _c.wrap = true
                    _c.padding = 16
                    _c.text = 'THE INTENDED FILEDROP TARGET MUST HAVE CSS POSITION SET TO "RELATIVE" OR "ABSOLUTE"'
                    _c.color = 'red'
                    _c.size = 32
                    _c.frosted = true
                })
           
                return
            } else {
                if (component.onFileDrop.customize){
                    component.onFileDrop.customize(_c)
                } else {
                    if (!component.onFileDrop.noDefaultMessage){
                        _c.add.text(_c => {
                            _c.style.position = 'absolute'
                            _c.wrap = true
                            _c.padding = 16
                            _c.text = component.onFileDrop.text || 'Drop files here'
                            _c.size = 32
                            _c.roundness = 12
                            _c.frosted = true
                        })
                    }
                }
            }

            if (component.onFileDropInitiated) component.onFileDropInitiated(_c)
        })
    }

    removeFileDropArea(component, _e, path){
        _e.sk_origin = 'sk_fileDrop'

        component.element.removeEventListener('dragover', this.overFunc)
        component.element.removeEventListener('dragleave', this.leaveFunc)
        if (component.fileDropArea) component.fileDropArea.remove()
        delete component.fileDropArea
        // The drag is over: the next one over it notifies its start again.
        delete component.fileDropStartNotified

        if (component.onFileDropEnded) component.onFileDropEnded(component)

        if (_e.type === 'drop'){
            var target = this.findFirstSubscriberOccurance(path || this.pathOf(_e), component.uuid)
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

        for (var subscriber of this.active){
            if (subscriber.onFileDrop.hidden){
                subscriber.fileDropArea.outline.style.borderColor = 'transparent'
                continue
            }
        }

        clearInterval(this.outlineAnimatorTimer)
        this.outlineAnimatorTimer = setInterval(()=>{
            this.outlineOpacity = (this.outlineAnimatorReverse ? this.outlineOpacity-stepping : this.outlineOpacity+stepping)
            for (var subscriber of this.active){
                if (subscriber.onFileDrop.hidden || !subscriber.fileDropArea) continue
                subscriber.fileDropArea.outline.style.borderColor = `rgba(255,255,255,${this.outlineOpacity})`
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