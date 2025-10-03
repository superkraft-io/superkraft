console.log('sk_windowHandler loaded');

class SK_WindowHandler {
  constructor(opts = {}) {
    this.selectors  = toArr(opts.selectors ?? '.sk_window_drag');
    this.attributes = toArr(opts.attributes ?? 'sk_window_drag');
    this.onAdd      = opts.onAdd ?? (() => {});
    this.onRemove   = opts.onRemove ?? (() => {});
    this.matched    = new WeakSet();
    this.obs        = null;

    // Ensure we initialize when DOM is actually ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.#init(), { once: true });
    } else {
      this.#init();
    }

    function toArr(x){ return Array.isArray(x) ? x : [x]; }
  }

  #init() {
    // 1) Observe
    this.obs = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'attributes') {
          this.recheck(m.target, m.attributeName, m.oldValue);
        } else if (m.type === 'childList') {
          for (const n of m.addedNodes) this.scan(n);
          for (const n of m.removedNodes) this.untrackRemoved(n);
        }
      }
    });

    this.obs.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ['class', ...this.attributes],
      childList: true
    });

    // 2) Prime scan: run twice — immediately, then next frame —
    //    to catch nodes & classes applied by other boot code.
    this.scan(document);
    requestAnimationFrame(() => this.scan(document));

    // 3) Final safety net when the page fully completes (images, async HTML, etc.)
    const onRS = () => {
      if (document.readyState === 'complete') {
        this.scan(document);
        document.removeEventListener('readystatechange', onRS);
      }
    };
    document.addEventListener('readystatechange', onRS);
  }

  disconnect(){ this.obs?.disconnect(); }

  isDraggable(el){
    if (!(el instanceof Element)) return false;
    for (const a of this.attributes) if (el.hasAttribute(a)) return true;
    for (const s of this.selectors)  if (el.matches(s)) return true;
    return false;
  }

  handleDraggableElements(el){ return this.isDraggable(el); }

  findAll(){
    const attrSel = this.attributes.map(a => `[${CSS.escape(a)}]`);
    const allSel  = [...this.selectors, ...attrSel].join(',');
    return Array.from(document.querySelectorAll(allSel));
  }

  scan(root){
    if (!(root instanceof Node)) return;
    if (root instanceof Element) this.#trackIfMatch(root);

    if (root instanceof Element || root instanceof Document || root instanceof DocumentFragment) {
      const attrSel = this.attributes.map(a => `[${CSS.escape(a)}]`);
      const allSel  = [...this.selectors, ...attrSel].join(',');
      root.querySelectorAll(allSel).forEach(el => this.#trackIfMatch(el));
    }
  }

  recheck(el){
    if (!(el instanceof Element)) return;
    const now = this.isDraggable(el);
    const was = this.matched.has(el);
    if (now && !was){
        this.matched.add(el);
        if (this.onAdd) this.onAdd(el);
        handleDraggableElementAdded(el)
    }
    else if (!now && was){ this.matched.delete(el); this.onRemove(el); }
  }

  #trackIfMatch(el){
    if (this.isDraggable(el) && !this.matched.has(el)){
      this.matched.add(el);
      this.onAdd(el);
    }
  }

  untrackRemoved(node){
    if (!(node instanceof Element)) return;
    if (this.matched.has(node)){ this.matched.delete(node); this.onRemove(node); }
    node.querySelectorAll('*').forEach(el => {
      if (this.matched.has(el)){ this.matched.delete(el); this.onRemove(el); }
    });
  }
  
    
    handleDraggableElementAdded(el){
        console.log('added draggable element', el);
    }

    handleDraggableElementRemoved(el){
        console.log('removed draggable element', el);
    }
}