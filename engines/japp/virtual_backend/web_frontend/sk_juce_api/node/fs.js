module.exports = {    
    promises: {
        async access(path) {
            var res = await window.sk_ipc.ipc.request('node:fs', { operation: 'access', path: path })
            return res
        },

        stat(path) {
            return new Promise(async (resolve, reject) => {
                try {
                    var info = await window.sk_ipc.ipc.request('node:fs', { operation: 'stat', path: path })
                    info.isDirectory = () => { return info.type === 'dir' }
                    resolve(info)
                } catch (err) {
                    reject(err)
                }
            })
        },

        writeFile(path, data) {
            return window.sk_ipc.ipc.request('node:fs', { operation: 'writeFile', path: path, data: data })
        },

        readFile(path) {
            return new Promise(async (resolve, reject) => {
                try {
                    var res = await window.sk_ipc.ipc.request('node:fs', { operation: 'readFile', path: path })

                    resolve(atob(res))
                } catch (err) {
                    reject(err)
                }
            })
        },

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
        },

        async readJSON(path) {
            return JSON.parse(await window.sk_ipc.ipc.request('node:fs', { operation: 'readJSON', path: path }))
        },

        async writeJSON(path, data) {
            return JSON.parse(await window.sk_ipc.ipc.request('node:fs', { operation: 'writeJSON', path: path, data: JSON.stringify(data) }))
        }
    }
}