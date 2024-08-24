module.exports = __sk_node_process = {
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

__sk_node_process

sk_juce_api.awaitIPC(()=>{
    = sk_juce_api.fetch('sk.getMachineStaticInfo')
})
