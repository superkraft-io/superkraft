
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

        var res = await window.sk_ipc.ipc.request('node:fs', { operation: 'access', path: path })

        return res
    }

    stat(path) {
        console.log('stat')

        return new Promise(async (resolve, reject) => {
            try {
                var info = await window.sk_ipc.ipc.request('node:fs', { operation: 'stat', path: path })
                info.isDirectory = () => { return info.type === 'dir' }
                resolve(info)
            } catch (err) {
                reject(err)
            }
        })
    }

    writeFile(path, data) {
        console.log('writeFile')
        return window.sk_ipc.ipc.request('node:fs', { operation: 'writeFile', path: path, data: data })
    }

    readFile(path) {
        console.log('readFile')
        return new Promise(async (resolve, reject) => {
            try {
                var res = await window.sk_ipc.ipc.request('node:fs', { operation: 'readFile', path: path })

                resolve(atob(res))
            } catch (err) {
                reject(err)
            }
        })
    }

    readdir(path, asObj) {
        return new Promise(async (resolve, reject) => {
            try {
                var res = await window.sk_ipc.ipc.request('node:fs', { operation: 'readdir', path: path })

                var list = []

                for (var i = 0; i < res.length; i++) {
                    list.push((!asObj ? res[i].name : res[i]))
                }

                resolve(list)
            } catch (err) {
                reject(err)
            }
        })
    }

    async readJSON(path) {
        console.log('readJSON')
        return JSON.parse(await window.sk_ipc.ipc.request('node:fs', { operation: 'readJSON', path: path }))
    }

    async writeJSON(path, data) {
        console.log('writeJSON')
        return JSON.parse(await window.sk_ipc.ipc.request('node:fs', { operation: 'writeJSON', path: path, data: JSON.stringify(data) }))
    }
}