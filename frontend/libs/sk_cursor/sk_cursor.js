/*
This must be created in the client window, e.g inside a view.

sk.views.dapp_cursor.add
*/
class SK_Cursor {
    constructor(opt){
        this.opt = opt
    }

    proxify(target){

    }

    interceptMethodCalls(obj, fn){
        return new Proxy(obj, {
            get(target, prop) {
                if (typeof target[prop] === 'function') {
                return new Proxy(target[prop], {
                    apply: (target, thisArg, argumentsList) => {
                    fn(prop, argumentsList);
                    return Reflect.apply(target, thisArg, argumentsList);
                    }
                });
                } else {
                    return Reflect.get(target, prop);
                }
            }
        })
    }
}