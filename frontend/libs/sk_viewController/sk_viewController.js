sk.utils.proxify = ()=>{
    return new Proxy({}, {
        get: (target, name, receiver)=>{
            //if (name === '__proto__') return Reflect.get(target, name)

            /*if (!target[name]) target[name] = sk.utils.proxify()
            
            return target[name]
            */

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

class SK_ViewController {
    constructor(opt){
        this.view = opt.view

        this.__proto__ = sk.utils.proxify()
    }
}