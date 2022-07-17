class SK_Comm {
    constructor(){

    }

    call(target, action, data){
        return new Promise(async (resolve, reject) => {
            var doReject = res => {
                reject(res)
            }
            try {
                var res = await sk_communicator.send({cmd: `action_${target}`, vid: sk.id, action: action, data: data})
                if (res.rejected || res.status === false){
                    if (this.print) console.error(res)
                    return doReject(res)
                }
                
                if (this.print) console.log(res)

                resolve(res)
            } catch(err) {
                doReject(err)
            }
        })
    }

    main(action, data){
        return this.call('root', action, data)
    }

    view(action, data){
        return this.call(sk.id, action, data)
    }
}