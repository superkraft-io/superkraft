class SK_Node_Process {
    get env(){
        return sk_juce_api.fetch('sk/getProcessInfo')
    },
    
    exec(command, options, callback){
        this.sk.ipc.toCBE('node:child_process', { func: 'exec', options: options }).then(res => {
            callback(res)
        })
    },

    execFile(file, args, options, callback){
        this.sk.ipc.toCBE('node:child_process', { func: 'execFile', args: args, options: options }).then(res => {
            callback(res)
        })
    },

    fork(file, args, option, callback){
        console.warning('node:child_process.fork() has not been implemented')
    },

    spawn(command, args, options){
        
        })
    }
}

sk_juce_api.node_process = new SK_Node_Process()

sk_juce_api.machineInfo = sk_juce_api.node_process

