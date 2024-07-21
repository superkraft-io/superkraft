
module.exports = class SK_VFS_JUCE {
    constructor(opt) {
        this.sk = opt.sk
        this.promises = new SK_VFS_Promises_JUCE(this)

        window.vfs = this
    }

    async init() {
        if (this.promises.init) this.promises.init()
    }
}

class SK_VFS_Promises_JUCE {
    constructor(parent) {
        this.parent = parent
        this.sk = parent.sk
    }

    init() {
    }

    async access(path) {
        return this.sk.ipc.toCBE('sk_vfs', { operation: 'access', path: path })
    }

    stat(path) {
        return new Promise(async (resolve, reject) => {
            try {
                var info = await this.sk.ipc.toCBE('sk_vfs', { operation: 'stat', path: path })
                info.isDirectory = () => { return info.type === 'dir' }
                resolve(info)
            } catch (err) {
                reject(err)
            }
        })
    }

    writeFile(path, data) {
        console.log('writeFile')
        return this.sk.ipc.toCBE('sk_vfs', { operation: 'writeFile', path: path, data: { fileData: data } })
    }

    readFile(path) {
        console.log('readFile')
        return this.sk.ipc.toCBE('sk_vfs', { operation: 'readFile', path: path })
    }

    readdir(path, asObj) {
        return new Promise(async (resolve, reject) => {
            try {
                var res = await this.sk.ipc.toCBE('sk_vfs', { operation: 'readdir', path: path })
                var list = []
                for (var i in res) list.push((!asObj ? res[i].name : res[i]))
                resolve(list)
            } catch (err) {
                reject(err)
            }
        })
    }

    async readJSON(path) {
        console.log('readJSON')
        return JSON.parse(await this.sk.ipc.toCBE('sk_vfs', { operation: 'readJSON', path: path }))
    }

    async writeJSON(path, data) {
        console.log('writeJSON')
        return JSON.parse(await this.sk.ipc.toCBE('sk_vfs', { operation: 'writeJSON', path: path, data: JSON.stringify(data) }))
    }
}