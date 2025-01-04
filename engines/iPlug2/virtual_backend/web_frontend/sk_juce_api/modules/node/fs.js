function __fs_req_sync(operation, opt, async) {
    var res = sk_juce_api.fetch('node/fs', { ...{ operation: operation }, ...opt })
    return res
}

async function __fs_req_async(operation, opt, async) {
    var res = await window.sk_ipc.ipc.request('node:fs', { ...{ operation: operation }, ...opt })
    return res
}
var __fs = {
    accessSync(path) {
        var res = __fs_req_sync('access', { path: path })
        return res
    },

    statSync(path) {
        try {
            var info = __fs_req_sync('stat', { path: path })
            info.isDirectory = () => { return info.type === 'dir' }
            return info
        } catch (err) {
            throw err
        }
    },

    writeFileSync(path, data) {
        return __fs_req_sync('writeFile', { path: path, data: data })
    },

    readFileSync(path) {
        try {
            var res = __fs_req_sync('readFile', { path: path })

            return atob(res)
        } catch (err) {
            throw err
        }
    },

    readdirSync(path, asObj) {
        try {
            var res = __fs_req_sync('readdir', { path: path })

            var list = []

            for (var i = 0; i < res.length; i++) {
                list.push((!asObj ? res[i].name : res[i]))
            }

            return list
        } catch (err) {
            throw err
        }
    },

    unlinkSync(path) {
        try {
            var res = __fs_req_sync('unlink', { path: path })
            if (res.error) throw res.err
        } catch (err) {
            throw err
        }
    },

    rmSync(path, options = {}){
        var defOpts = {
            force: false,
            maxRetries: 0,
            recursive: false,
            retryDelay: 100
        }

        defOpts = { ...defOpts, ...options }

        var cancel = false
        function removeDirectoryRecursive(directoryPath) {
            if (cancel) return

            const files = __fs.readdirSync(directoryPath);

            if (files.length === 0) {
                __fs.unlinkSync(directoryPath)
                return
            }

            // Iterate through each file/directory
            for (const file of files) {
                var filePath = directoryPath + '/' + file;
                filePath = filePath.split('\\').join('/')
                filePath = filePath.split('//').join('/')

                if (__fs.statSync(filePath).isDirectory()) {
                    removeDirectoryRecursive(filePath)
                    if (cancel) return
                } else {
                    var fileFailed = true
                    for (var attempt = 0; attempt <= defOpts.maxRetries; attempt++) {
                        try {
                            __fs.unlinkSync(filePath)
                            fileFailed = false
                        } catch (err) {
                        }
                    }

                    if (fileFailed) {
                        cancel = true
                        break
                    }
                }
            }

            if (cancel) return

            // After all files and subdirectories are removed, remove the empty directory
           

            removeDirectoryRecursive(directoryPath)
        }


        if (__fs.statSync(path).isDirectory()) removeDirectoryRecursive(path)
        else __fs.unlinkSync(path)
    },

    mkdirSync(path, options) {
        var defOpts = {
            recursive: false,
            mode: '0x777'
        }

        defOpts = { ...defOpts, ...options }


        try {
            var res = __fs_req_sync('mkdir', { ...{ path: path }, ...defOpts })
            if (res.error) throw res.err
        } catch (err) {
            throw err
        }
    },


    promises: {
        async access(path) {
            var res = await __fs_req_async('access', { path: path })
            return res
        },

        stat(path) {
            return new Promise(async (resolve, reject) => {
                try {
                    var info = await __fs_req_async('stat', { path: path })
                    info.isDirectory = () => { return info.type === 'dir' }
                    resolve(info)
                } catch (err) {
                    reject(err)
                }
            })
        },

        writeFile(path, data) {
            return __fs_req_async('writeFile', { path: path, data: data })
        },

        readFile(path) {
            return new Promise(async (resolve, reject) => {
                try {
                    var res = await __fs_req_async('readFile', { path: path })

                    resolve(atob(res))
                } catch (err) {
                    reject(err)
                }
            })
        },

        readdir(path, asObj) {
            return new Promise(async (resolve, reject) => {
                try {
                    var res = await __fs_req_async('readdir', { path: path })

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

        mkdir() {
            return new Promise(async (resolve, reject) => {
                try {
                    var res = __fs_req_sync('mkdir', { ...{ path: path }, ...defOpts })
                    if (res.error) return reject(res.err)
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })
        },

        rm(path, options) {
            return new Promise(async (resolve, reject) => {
                try {
                    var res = __fs.rm(path, options)
                    if (res.error) return reject(res.err)
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })
        },

        mkdir(path, options) {
            return new Promise(async (resolve, reject) => {
                try {
                    var res = __fs.mkdir(path, options)
                    if (res.error) return reject(res.err)
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })
        },
    }
}

module.exports = __fs