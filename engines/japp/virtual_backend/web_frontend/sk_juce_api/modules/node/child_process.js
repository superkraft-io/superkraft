module.exports = {
    exec(command, options, callback){
        this.sk.ipc.request('node:child_process', { func: 'exec', options: options }).then(res => {
            callback(res)
        })
    },

    execFile(file, args, options, callback){
        this.sk.ipc.request('node:child_process', { func: 'execFile', args: args, options: options }).then(res => {
            callback(res)
        })
    },

    fork(file, args, option, callback){
        console.warning('node:child_process.fork() has not been implemented')
    },

    spawn(command, args, options){
        this.sk.ipc.request('node:child_process', { func: 'spawn', args: args, options: options }).then(res => {
            
        })
    }
}
