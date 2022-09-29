class SK_Mobile {
    constructor(opt){
        this.opt = opt
        this.update()
    }

    update(){
        if (!sk.isOnMobile) return
        if (this.test_iOS()) this.os = 'ios'
        if (this.test_android()) this.os = 'android'

        this.isStandalone = this.appIsStandalone()


        var observer = new ResizeObserver(()=>{ this.updateOrientation() }).observe(document.body)
        setTimeout(()=>{ this.updateOrientation() }, 100)
    }

    test_iOS(){
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test( userAgent );
    }

    test_android(){
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /android/.test(navigator.userAgent);
    }
    
    appIsStandalone(){
        if (this.os) return ('standalone' in window.navigator) && (window.navigator.standalone)
    }

    updateOrientation(){
        if (sk.isOnMobile && window.innerWidth > window.innerHeight) this.orientation = 'landscape'
        else this.orientation = 'portrait'
        sk.ums.broadcast('sk_mobile', undefined, this)
    }
}