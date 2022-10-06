class SK_Mobile {
    constructor(opt){
        this.opt = opt
        this.update()

        this.debugData = {}

    }

    get debugStr(){
        var html = ''
        for (var key in this.debugData){
            html += `<div>${key}: ${this.debugData[key]}</div><br>`
        }
        return html
    }

    update(){
        if (!sk.isOnMobile) return
        if (this.test_iOS()) this.os = 'ios'
        if (this.test_android()) this.os = 'android'

        this.isStandalone = this.appIsStandalone()


        var observer = new ResizeObserver(()=>{
            this.updateOrientation()
        }).observe(document.body)

        window.addEventListener('orientationchange', ()=>{
            this.updateOrientation()
        })
        
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
        
        this.orientation = (window.orientation.toString().indexOf('90') > -1 ? 'landscape' : 'portrait')

        this.debugData = {
            'sk.isOnMobile': sk.isOnMobile,
            'window.innerWidth': window.innerWidth,
            'window.innerHeight': window.innerHeight,
            'this.orientation': this.orientation,
            'this.lockOrientation': this.lockOrientation
        }
        
       

        var elementList = document.getElementsByTagName('*')
        for(var i = 0; i < elementList.length; i++){
            elementList[i].classList.remove('sk_ui_mobile_orientation_portrait')
            elementList[i].classList.remove('sk_ui_mobile_orientation_landscape')
            elementList[i].classList.add('sk_ui_mobile_orientation_' + this.orientation)
        }

        if (this.lockOrientation){
            if (this.orientation !== this.lockOrientation){
                try {
                    sk.app.body.transition('fade out')
                    this.screenOrientationMsg = sk.app.add.mobileOrientationMsg(_c => {
                        _c.transition('fade in')
                    })
                } catch(err) {
                    alert(`[Superkraft] ERROR: This view has locked orientation to "${this.orientation}" but no screen orientation message UI component has been defined.` )
                }
            } else {
                if (this.screenOrientationMsg){
                    // this.screenOrientationMsg.transition('fade out').then(()=>{
                        this.screenOrientationMsg.remove()
                    //})
                    sk.app.body.transition('fade in')
                }
            }
        }

        sk.ums.broadcast('sk_mobile', undefined, this)
    }
}