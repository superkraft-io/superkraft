
module.exports = class SK_FS_JUCE {
    constructor(opt){
        this.sk = opt.sk
        this.promises = new SK_FS_Promises_JUCE(this)

        window.fs = this
    }
    
    async init(){
        if (this.promises.init) this.promises.init()
    }
}

class SK_FS_Promises_JUCE {
    constructor(parent){
        this.parent = parent
        this.sk = parent.sk
    }

    init(){
    }

    async access(path) {
        console.log('access')
        return this.sk.ipc.toCBE('sk_fs', {operation: 'access', path: path })
    }

    stat(path) {
        console.log('stat')
        return this.sk.ipc.toCBE('sk_fs', { operation: 'stat', path: path })
    }

    writeFile(path, data) {
        console.log('writeFile')
        return this.sk.ipc.toCBE('sk_fs', { operation: 'writeFile', path: path, data: JSON.stringify(data) })
    }

    readFile(path) {
        console.log('readFile')
        return this.sk.ipc.toCBE('sk_fs', { operation: 'readFile', path: path })
    }

    readdir(path) {
        console.log('readdir')
        return this.sk.ipc.toCBE('sk_fs', { operation: 'readdir', path: path })
    }

    async readJSON(path) {
        console.log('readJSON')
        return JSON.parse(await this.sk.ipc.toCBE('sk_fs', { operation: 'readJSON', path: path }))
    }

    async writeJSON(path, data) {
        console.log('writeJSON')
        return JSON.parse(await this.sk.ipc.toCBE('sk_fs', { operation: 'writeJSON', path: path, data: JSON.stringify(data) }))
    }
}