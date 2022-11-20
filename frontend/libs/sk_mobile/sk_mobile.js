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
        if (this.test_iOS()) sk.os = 'ios'
        if (this.test_android()) sk.os = 'android'

        this.getModel()

        this.isStandalone = this.appIsStandalone()


        var observer = new ResizeObserver(()=>{
            this.updateOrientation()
        }).observe(document.body)

        window.addEventListener('orientationchange', ()=>{
            this.updateOrientation()
        })
        
        setTimeout(()=>{ this.updateOrientation() }, 30)
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
        if (sk.os) return ('standalone' in window.navigator) && (window.navigator.standalone)
    }

    updateOrientation(){
        var orientation = ''
        if (sk.isOnMobile && window.innerWidth > window.innerHeight) orientation = 'landscape'
        else orientation = 'portrait'
        
        

        orientation = (window.orientation.toString().indexOf('90') > -1 ? 'landscape' : 'portrait')
        
        if (orientation === this.orientation) return


        this.orientation = orientation

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
                        //_c.style.zIndex = 0
                        _c.transition('fade in')
                    })
                } catch(err) {
                    alert(`[Superkraft] ERROR: This view has locked orientation to "${this.orientation}" but no screen orientation message UI component has been defined.` )
                }
            } else {
                if (this.screenOrientationMsg){
                    this.screenOrientationMsg.transition('fade out').then(async ()=>{
                        this.screenOrientationMsg.element.remove()
                    })
                    sk.app.body.transition('fade in')
                }
            }
        }

        sk.ums.broadcast('sk_mobile', undefined, this)
    }

    getModel(){
        if (sk.os === 'ios') this.getModel_Apple()
    }

    getModel_Apple(){
        var devices = [{
            generation: 6,
            height: 2732,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2022,
            scale: 2,
            size: 12.9,
            width: 2048
        }, {
            generation: 6,
            height: 2388,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2022,
            scale: 2,
            size: 11,
            width: 1668
        }, {
            generation: 10,
            height: 2360,
            model: "ipad",
            ppi: 264,
            releaseDate: 2022,
            scale: 2,
            size: 10.9,
            width: 1640
        }, {
            generation: 1,
            height: 2778,
            model: "iphone_14_plus",
            ppi: 458,
            releaseDate: 2022,
            scale: 3,
            size: 6.7,
            width: 1284,
            homeButton: false
        }, {
            generation: 1,
            height: 2796,
            model: "iphone_14_pro_max",
            ppi: 460,
            releaseDate: 2022,
            scale: 3,
            size: 6.7,
            width: 1290,
            homeButton: false
        }, {
            generation: 1,
            height: 2556,
            model: "iphone_14_pro",
            ppi: 460,
            releaseDate: 2022,
            scale: 3,
            size: 6.1,
            width: 1179,
            homeButton: false
        }, {
            generation: 1,
            height: 2532,
            model: "iphone_14",
            ppi: 460,
            releaseDate: 2022,
            scale: 3,
            size: 6.1,
            width: 1170,
            homeButton: false
        }, {
            generation: 3,
            height: 1334,
            model: "iphone_se",
            ppi: 326,
            releaseDate: 2022,
            scale: 2,
            size: 4.7,
            width: 750
        }, {
            generation: 5,
            height: 2360,
            model: "ipad_air",
            ppi: 264,
            releaseDate: 2022,
            scale: 2,
            size: 10.9,
            width: 1640
        }, {
            generation: 1,
            height: 2532,
            model: "iphone_13",
            ppi: 460,
            releaseDate: 2021,
            scale: 3,
            size: 6.06,
            width: 1170,
            homeButton: false
        }, {
            generation: 1,
            height: 2340,
            model: "iphone_13_mini",
            ppi: 476,
            releaseDate: 2021,
            scale: 3,
            size: 5.42,
            width: 1080,
            homeButton: false
        }, {
            generation: 1,
            height: 2778,
            model: "iphone_13_pro_max",
            ppi: 458,
            releaseDate: 2021,
            scale: 3,
            size: 6.68,
            width: 1284,
            homeButton: false
        }, {
            generation: 1,
            height: 2532,
            model: "iphone_13_pro",
            ppi: 460,
            releaseDate: 2021,
            scale: 3,
            size: 6.06,
            width: 1170,
            homeButton: false
        }, {
            generation: 9,
            height: 2160,
            model: "ipad",
            ppi: 264,
            releaseDate: 2021,
            scale: 2,
            size: 10.2,
            width: 1620
        }, {
            generation: 5,
            height: 2732,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2021,
            scale: 2,
            size: 12.9,
            width: 2048
        }, {
            generation: 5,
            height: 2388,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2021,
            scale: 2,
            size: 11,
            width: 1668
        }, {
            generation: 4,
            height: 2360,
            model: "ipad_air",
            ppi: 264,
            releaseDate: 2020,
            scale: 2,
            size: 10.9,
            width: 1640
        }, {
            generation: 1,
            height: 2532,
            model: "iphone_12",
            ppi: 460,
            releaseDate: 2020,
            scale: 3,
            size: 6.06,
            width: 1170,
            homeButton: false
        }, {
            generation: 1,
            height: 2340,
            model: "iphone_12_mini",
            ppi: 476,
            releaseDate: 2020,
            scale: 3,
            size: 5.42,
            width: 1080,
            homeButton: false
        }, {
            generation: 1,
            height: 2778,
            model: "iphone_12_pro_max",
            ppi: 458,
            releaseDate: 2020,
            scale: 3,
            size: 6.68,
            width: 1284,
            homeButton: false
        }, {
            generation: 1,
            height: 2532,
            model: "iphone_12_pro",
            ppi: 460,
            releaseDate: 2020,
            scale: 3,
            size: 6.06,
            width: 1170,
            homeButton: false
        }, {
            generation: 8,
            height: 2160,
            model: "ipad",
            ppi: 264,
            releaseDate: 2020,
            scale: 2,
            size: 10.2,
            width: 1620
        }, {
            generation: 2,
            height: 1334,
            model: "iphone_se",
            ppi: 326,
            releaseDate: 2020,
            scale: 2,
            size: 4.7,
            width: 750
        }, {
            generation: 4,
            height: 2732,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2020,
            scale: 2,
            size: 12.9,
            width: 2048
        }, {
            generation: 4,
            height: 2388,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2020,
            scale: 2,
            size: 11,
            width: 1668
        }, {
            generation: 7,
            height: 2160,
            model: "ipad",
            ppi: 264,
            releaseDate: 2019,
            scale: 2,
            size: 10.2,
            width: 1620
        }, {
            generation: 1,
            height: 2688,
            model: "iphone_11_pro_max",
            ppi: 458,
            releaseDate: 2019,
            scale: 3,
            size: 6.46,
            width: 1242,
            homeButton: false
        }, {
            generation: 1,
            height: 2436,
            model: "iphone_11_pro",
            ppi: 458,
            releaseDate: 2019,
            scale: 3,
            size: 5.85,
            width: 1125,
            homeButton: false
        }, {
            generation: 1,
            height: 1792,
            model: "iphone_11",
            ppi: 326,
            releaseDate: 2019,
            scale: 2,
            size: 6.1,
            width: 828,
            homeButton: false
        }, {
            generation: 7,
            height: 1136,
            model: "ipod_touch",
            ppi: 326,
            releaseDate: 2019,
            scale: 2,
            size: 4,
            width: 640
        }, {
            generation: 6,
            height: 2266,
            model: "ipad_mini",
            ppi: 326,
            releaseDate: 2019,
            scale: 2,
            size: 8.3,
            width: 1488
        }, {
            generation: 5,
            height: 2048,
            model: "ipad_mini",
            ppi: 326,
            releaseDate: 2019,
            scale: 2,
            size: 7.9,
            width: 1536
        }, {
            generation: 3,
            height: 2224,
            model: "ipad_air",
            ppi: 264,
            releaseDate: 2019,
            scale: 2,
            size: 10.5,
            width: 1668
        }, {
            generation: 3,
            height: 2732,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2018,
            scale: 2,
            size: 12.9,
            width: 2048
        }, {
            generation: 3,
            height: 2388,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2018,
            scale: 2,
            size: 11,
            width: 1668
        }, {
            generation: 1,
            height: 1792,
            model: "iphone_xr",
            ppi: 326,
            releaseDate: 2018,
            scale: 2,
            size: 6.06,
            width: 828,
            homeButton: false
        }, {
            generation: 1,
            height: 2688,
            model: "iphone_xs_max",
            ppi: 458,
            releaseDate: 2018,
            scale: 3,
            size: 6.46,
            width: 1242,
            homeButton: false
        }, {
            generation: 1,
            height: 2436,
            model: "iphone_xs",
            ppi: 458,
            releaseDate: 2018,
            scale: 3,
            size: 5.85,
            width: 1125,
            homeButton: false
        }, {
            generation: 6,
            height: 2048,
            model: "ipad",
            ppi: 264,
            releaseDate: 2018,
            scale: 2,
            size: 9.7,
            width: 1536
        }, {
            generation: 1,
            height: 2436,
            model: "iphone_x",
            ppi: 458,
            releaseDate: 2017,
            scale: 3,
            size: 5.85,
            width: 1125,
            homeButton: false
        }, {
            generation: 1,
            height: 1920,
            model: "iphone_8_plus",
            ppi: 401,
            releaseDate: 2017,
            scale: 3,
            size: 5.5,
            width: 1080
        }, {
            generation: 1,
            height: 1334,
            model: "iphone_8",
            ppi: 326,
            releaseDate: 2017,
            scale: 2,
            size: 4.7,
            width: 750
        }, {
            generation: 2,
            height: 2732,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2017,
            scale: 2,
            size: 12.9,
            width: 2048
        }, {
            generation: 2,
            height: 2224,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2017,
            scale: 2,
            size: 10.5,
            width: 1668
        }, {
            generation: 5,
            height: 2048,
            model: "ipad",
            ppi: 264,
            releaseDate: 2017,
            scale: 2,
            size: 9.7,
            width: 1536
        }, {
            generation: 1,
            height: 1920,
            model: "iphone_7_plus",
            ppi: 401,
            releaseDate: 2016,
            scale: 3,
            size: 5.5,
            width: 1080
        }, {
            generation: 1,
            height: 1334,
            model: "iphone_7",
            ppi: 326,
            releaseDate: 2016,
            scale: 2,
            size: 4.7,
            width: 750
        }, {
            generation: 1,
            height: 1136,
            model: "iphone_se",
            ppi: 326,
            releaseDate: 2016,
            scale: 2,
            size: 4,
            width: 640
        }, {
            generation: 1,
            height: 2048,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2016,
            scale: 2,
            size: 9.7,
            width: 1536
        }, {
            generation: 1,
            height: 2732,
            model: "ipad_pro",
            ppi: 264,
            releaseDate: 2015,
            scale: 2,
            size: 12.9,
            width: 2048
        }, {
            generation: 1,
            height: 1920,
            model: "iphone_6s_plus",
            ppi: 401,
            releaseDate: 2015,
            scale: 3,
            size: 5.5,
            width: 1080
        }, {
            generation: 1,
            height: 1334,
            model: "iphone_6s",
            ppi: 326,
            releaseDate: 2015,
            scale: 2,
            size: 4.7,
            width: 750
        }, {
            generation: 1,
            height: 2048,
            model: "ipad_mini_4",
            ppi: 326,
            releaseDate: 2015,
            scale: 2,
            size: 7.9,
            width: 1536
        }, {
            generation: 6,
            height: 1136,
            model: "ipod_touch",
            ppi: 326,
            releaseDate: 2015,
            scale: 2,
            size: 4,
            width: 640
        }, {
            generation: 1,
            height: 2048,
            model: "ipad_air_2",
            ppi: 326,
            releaseDate: 2014,
            scale: 2,
            size: 9.7,
            width: 1536
        }, {
            generation: 1,
            height: 2048,
            model: "ipad_mini_3",
            ppi: 264,
            releaseDate: 2014,
            scale: 2,
            size: 7.9,
            width: 1536
        }, {
            generation: 1,
            height: 1920,
            model: "iphone_6_plus",
            ppi: 401,
            releaseDate: 2014,
            scale: 3,
            size: 5.5,
            width: 1080
        }, {
            generation: 1,
            height: 1334,
            model: "iphone_6",
            ppi: 326,
            releaseDate: 2014,
            scale: 2,
            size: 4.7,
            width: 750
        }, {
            generation: 1,
            height: 2048,
            model: "ipad_mini_2",
            ppi: 326,
            releaseDate: 2013,
            scale: 2,
            size: 7.9,
            width: 1536
        }, {
            generation: 1,
            height: 2048,
            model: "ipad_air",
            ppi: 264,
            releaseDate: 2013,
            scale: 2,
            size: 9.7,
            width: 1536
        }, {
            generation: 1,
            height: 1136,
            model: "iphone_5c",
            ppi: 326,
            releaseDate: 2013,
            scale: 2,
            size: 4,
            width: 640
        }, {
            generation: 1,
            height: 1136,
            model: "iphone_5s",
            ppi: 326,
            releaseDate: 2013,
            scale: 2,
            size: 4,
            width: 640
        }, {
            generation: 4,
            height: 2048,
            model: "ipad",
            ppi: 264,
            releaseDate: 2012,
            scale: 2,
            size: 9.7,
            width: 1536
        }, {
            generation: 1,
            height: 1024,
            model: "ipad_mini",
            ppi: 163,
            releaseDate: 2012,
            scale: 1,
            size: 7.9,
            width: 768
        }, {
            generation: 5,
            height: 1136,
            model: "ipod_touch",
            ppi: 326,
            releaseDate: 2012,
            scale: 2,
            size: 4,
            width: 640
        }, {
            generation: 1,
            height: 1136,
            model: "iphone_5",
            ppi: 326,
            releaseDate: 2012,
            scale: 2,
            size: 4,
            width: 640
        }, {
            generation: 3,
            height: 2048,
            model: "ipad",
            ppi: 264,
            releaseDate: 2012,
            scale: 2,
            size: 9.7,
            width: 1536
        }, {
            generation: 1,
            height: 960,
            model: "iphone_4s",
            ppi: 326,
            releaseDate: 2011,
            scale: 2,
            size: 3.5,
            width: 640
        }, {
            generation: 1,
            height: 1024,
            model: "ipad_2",
            ppi: 132,
            releaseDate: 2011,
            scale: 1,
            size: 9.7,
            width: 768
        }, {
            generation: 4,
            height: 960,
            model: "ipod_touch",
            ppi: 326,
            releaseDate: 2010,
            scale: 2,
            size: 3.5,
            width: 640
        }, {
            generation: 1,
            height: 960,
            model: "iphone_4",
            ppi: 326,
            releaseDate: 2010,
            scale: 2,
            size: 3.5,
            width: 640
        }, {
            generation: 1,
            height: 1024,
            model: "ipad",
            ppi: 132,
            releaseDate: 2010,
            scale: 1,
            size: 9.7,
            width: 768
        }, {
            generation: 3,
            height: 480,
            model: "ipod_touch",
            ppi: 163,
            releaseDate: 2009,
            scale: 1,
            size: 3.5,
            width: 320
        }, {
            generation: 1,
            height: 480,
            model: "iphone_3gs",
            ppi: 163,
            releaseDate: 2009,
            scale: 1,
            size: 3.5,
            width: 320
        }, {
            generation: 2,
            height: 480,
            model: "ipod_touch",
            ppi: 163,
            releaseDate: 2008,
            scale: 1,
            size: 3.5,
            width: 320
        }, {
            generation: 1,
            height: 480,
            model: "iphone_3g",
            ppi: 163,
            releaseDate: 2008,
            scale: 1,
            size: 3.5,
            width: 320
        }, {
            generation: 1,
            height: 480,
            model: "ipod_touch",
            ppi: 163,
            releaseDate: 2007,
            scale: 1,
            size: 3.5,
            width: 320
        }, {
            generation: 1,
            height: 480,
            model: "iphone",
            ppi: 163,
            releaseDate: 2007,
            scale: 1,
            size: 3.5,
            width: 320
        }]

        var screenSize = {x: window.screen.width, y: window.screen.height}
        var windowSize = {x: window.innerWidth, y: window.innerHeight}

        var matches = {}

        for (var i in devices){
            var device = devices[i]
            var scaledSize = {x: device.width / device.scale, y: device.height / device.scale}
            
            if (device.width === screenSize.x && device.height === screenSize.y) matches[device.model] = device
            if (screenSize.x === scaledSize.x && screenSize.y === scaledSize.y) matches[device.model] = device
        }

        this.matchingDevices = matches
    }

    getDeviceClasses(){
        var allClasses = []
        for (var i in this.matchingDevices){
            var device = this.matchingDevices[i]
            var classes = [
                'sk_ui_device_' + device.model,
                'sk_ui_device_gen_' + device.generation
            ]

            if (device.homeButton === false){
                this.homeButton = device.homeButton
                classes.push('sk_ui_device_noHomeButton')
            }

            allClasses.push(classes.join(' '))
        }

        return allClasses.join(' ')
    }
}