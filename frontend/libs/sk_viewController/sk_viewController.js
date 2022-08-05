class SK_ViewController {
    constructor(opt){
        this.view = opt.view

        this.__proto__.__proto__  = new Proxy({}, {
            get: function (target, name) {
                return async function (){
                    var args = Array.prototype.slice.call(arguments);
                    
                    var objList = {}
                    for (var i = 0; i < args.length; i++) objList = {...objList, ...args[i]}

                    var res = await sk.comm.main(
                        'windowAction',
                        {
                            ...{view: this.view, action: name},
                            ...objList
                        }
                    )
                    return res
                }
            }
        });


        
    }
}