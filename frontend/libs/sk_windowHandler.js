console.log('sk_windowHandler loaded');


console.log('sk_windowHandler loaded');

class SK_WindowHandler {
    constructor() {
        this.draggableElements = {}

        this.initObserver()


        setTimeout(()=>{
            this.globalScanOnce()
        }, 100)
    }

    initObserver(){
        this.obs = new MutationObserver(muts => {
            for (const m of muts) {
                if (m.type === 'attributes') {
                    this.recheck(m.target, m.attributeName, m.oldValue);
                } else if (m.type === 'childList') {
                    for (const n of m.addedNodes){
                        this.handleDraggableElementAdded(n)
                    }
                    
                    for (const n of m.removedNodes){
                        this.handleDraggableElementRemoved(n)
                    }
                }
            }
        });

        this.obs.observe(document.documentElement, {
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['.sk_window_drag', 'sk_window_drag'],
            childList: true
        });
    }

    globalScanOnce(){
        var list = document.querySelectorAll('[sk_window_drag], .sk_window_drag')
        for (var i = 0; i < list.length; i++){
            this.handleDraggableElementAdded(list[i]);
        }
    }
  
    checkIfDraggable(el){
        try {
            return el.hasAttribute('sk_window_drag') || el.classList.contains('sk_window_drag');
        } catch(e){
            return false;
        }
    }

    handleDraggableElementAdded(el){
        if (!this.checkIfDraggable(el)) return
        
        var suo = el.sk_ui_obj;
        this.draggableElements[el.id] = suo;

        this.addEventListeners(suo)
    }

    handleDraggableElementRemoved(el){
        if (!this.checkIfDraggable(el)) return

        console.log('removed draggable element', el);
        delete this.draggableElements[el.id]
    }

    addEventListeners(_c){
        if (!_c) return;

        _c.element.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // only left click

            console.log('start dragging window');
            sk_api.window.beginMoveWindow()
        })
    }
}