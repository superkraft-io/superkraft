class sk_ui_infinite_list extends sk_ui_iceRink {
    constructor(opt){
        super(opt)

        this.autoHeight = false
        this.content.styling = 'top middle ttb fullwidth'
        this.content.position = 'relative'

        this.__itemSize = 32

        this.onResized = ()=>{
             this.createPlaceholders()
        }

        this.onScroll = ()=>{
            this.createPlaceholders()
        }

        this.placeHolderPool = []
    }

    createPlaceholders(){
        let itemCount = this.__itemCount || 0;
        let fitCount = this.itemsFitInHeight;
        let buffer = 2;
        let neededPlaceholders = Math.min(itemCount, fitCount) + buffer;
        if (itemCount <= fitCount) neededPlaceholders = itemCount;
        if (!neededPlaceholders) return;

        // Add placeholders if needed
        while (this.placeHolderPool.length < neededPlaceholders) {
            let maxTop = -Infinity;
            for (let i = 0; i < this.placeHolderPool.length; i++) {
                let t = parseFloat(this.placeHolderPool[i].style.top || '0');
                if (t > maxTop) maxTop = t;
            }
            if (maxTop === -Infinity) maxTop = 0 - this.__itemSize;
            let newTop = maxTop + this.__itemSize;
            let placeholder = this.content.add.fromNew(sk_ui_infinite_list_placeholderItem, _c => {
                _c.classAdd('sk_ui_infinite_list_placeholderItem_animated');
                _c.style.top = newTop + 'px';
            });
            this.placeHolderPool.push(placeholder);
        }

        // Remove placeholders if there are too many
        while (this.placeHolderPool.length > neededPlaceholders) {
            let minTop = Math.abs(this.scrollY) - this.__itemSize;
            let maxTop = Math.abs(this.scrollY) + (this.itemsFitInHeight + 1) * this.__itemSize;
            let sorted = this.placeHolderPool.slice().sort((a, b) => {
                let atop = parseFloat(a.style.top || '0');
                let btop = parseFloat(b.style.top || '0');
                let adist = 0, bdist = 0;
                if (atop < minTop) adist = minTop - atop;
                else if (atop > maxTop) adist = atop - maxTop;
                if (btop < minTop) bdist = minTop - btop;
                else if (btop > maxTop) bdist = btop - maxTop;
                return bdist - adist;
            });
            let toRemove = sorted[0];
            let idx = this.placeHolderPool.indexOf(toRemove);
            if (idx !== -1) this.placeHolderPool.splice(idx, 1);
            toRemove.remove();
        }


        // Always update top for all placeholders (fixes bugs on resize/small lists)
        if (itemCount <= fitCount) {
            for (let i = 0; i < this.placeHolderPool.length; i++) {
                let placeholder = this.placeHolderPool[i];
                placeholder.style.top = (i * this.__itemSize) + 'px';
            }
            return;
        }

        // Only do wrap-around if there are more items than fit in the list
        if (itemCount > fitCount) {
            let minTop = Math.abs(this.scrollY) - this.__itemSize;
            let maxTop = Math.abs(this.scrollY) + (this.itemsFitInHeight + 1) * this.__itemSize;
            for (let i = 0; i < this.placeHolderPool.length; i++) {
                let placeholder = this.placeHolderPool[i];
                let top = parseFloat(placeholder.style.top || '0');
                while (top < minTop) {
                    top += this.placeHolderPool.length * this.__itemSize;
                    placeholder.style.top = top + 'px';
                    placeholder.resetAnimation();
                }
                while (top > maxTop) {
                    top -= this.placeHolderPool.length * this.__itemSize;
                    placeholder.style.top = top + 'px';
                    placeholder.resetAnimation();
                }
            }
        }
    }

    set itemCount(val){
        this.__itemCount = val

        var bottom = this.__itemSize * val

        this.content.style.height = bottom + 'px'

        this.doObserveOnce()
    }

    set itemSize(val){
        this.__itemSize = val
        this.doObserveOnce()
    }

    get itemsFitInHeight(){
        return Math.ceil(this.contentWrapper.rect.height / this.__itemSize)
    }
}

class sk_ui_infinite_list_placeholderItem extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = 'top left fullwidth'
        this.style.height = '32px'

        this.animate = false
    }

    async resetAnimation(){
        this.classRemove('sk_ui_infinite_list_placeholderItem_animated');
        requestAnimationFrame(() => {
            this.classAdd('sk_ui_infinite_list_placeholderItem_animated');
        });
    }
}