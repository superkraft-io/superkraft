var fs = require('fs')

var __fs_extra = {
    copy(src, dest, options, callback) {
        throw 'fs-extra.copy not implemented yet'
    },

    emptyDir(dir, callback) {
        throw 'fs-extra.emptyDir not implemented yet'
    },

    ensureFile(file, callback) {
        throw 'fs-extra.ensureFile not implemented yet'
    },

    ensureDir(dir, options, callback) {
        setTimeout(() => {
            try {
                var res = fs.mkdirSync(dir, options)
                callback(res)
            } catch (err) {
                callback(err)
            }
        })
    },

    ensureLink(srcPath, destPath, callback) {
        throw 'fs-extra.ensureLink not implemented yet'
    },

    ensureSymlink(srcPath, destPath, type, callback) {
        throw 'fs-extra.ensureSymlink not implemented yet'
    },

    mkdirp(dir, options, callback) {
        throw 'fs-extra.mkdirp not implemented yet'
    },

    mkdirs(dir, options, callback) {
        throw 'fs-extra.mkdirs not implemented yet'
    },

    move(src, dest, options, callback) {
        throw 'fs-extra.move not implemented yet'
    },

    outputFile(file, data, options, callback) {
        throw 'fs-extra.outputFile not implemented yet'
    },

    outputJson(file, object, options, callback) {
        throw 'fs-extra.outputJson not implemented yet'
    },

    pathExists(file, callback) {
        throw 'fs-extra.pathExists not implemented yet'
    },

    readJson(file, options, callback) {
        throw 'fs-extra.readJson not implemented yet'
    },

    remove(path, callback) {
        setTimeout(() => {
            try {
                var res = fs.rm(path, { recursive: true, force: true }, callback)
                callback(res)
            } catch (err) {
                callback(err)
            }
        })
        
    },

    writeJson(file, object, options, callback) {
        throw 'fs-extra.writeJson not implemented yet'
    },

    /*******/

    copySync() {
        throw 'fs-extra.copySync not implemented yet'
    },

    emptyDirSync() {
        throw 'fs-extra.emptyDirSync not implemented yet'
    },

    ensureFileSync() {
        throw 'fs-extra.ensureFileSync not implemented yet'
    },

    ensureDirSync(dir, options) {
        fs.mkdirSync(dir, options)
    },

    ensureLinkSync() {
        throw 'fs-extra.ensureLinkSync not implemented yet'
    },

    ensureSymlinkSync() {
        throw 'fs-extra.ensureSymlinkSync not implemented yet'
    },

    mkdirpSync() {
        throw 'fs-extra.mkdirpSync not implemented yet'
    },

    mkdirsSync() {
        throw 'fs-extra.mkdirsSync not implemented yet'
    },

    moveSync() {
        throw 'fs-extra.moveSync not implemented yet'
    },

    outputFileSync() {
        throw 'fs-extra.outputFileSync not implemented yet'
    },

    outputJsonSync() {
        throw 'fs-extra.outputJsonSync not implemented yet'
    },

    pathExistsSync() {
        throw 'fs-extra.pathExistsSync not implemented yet'
    },

    readJsonSync() {
        throw 'fs-extra.readJsonSync not implemented yet'
    },

    removeSync(path) {
        fs.rmSync(path, { recursive: true, force: true })
    },

    writeJsonSync() {
        throw 'fs-extra.writeJsonSync not implemented yet'
    },

    /******/

    promises: {
        copy() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.copy not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        emptyDir() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.emptyDir not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        ensureFile() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.ensureFile not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        ensureDir() {
            return new Promise((resolve, reject) => {
                try {
                    var res = fs.mkdirSync(dir, option)
                    resolve(res)
                } catch (err) {
                    reject(err)
                }
            })
        },

        ensureLink() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.ensureLink not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        ensureSymlink() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.ensureSymlink not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        mkdirp() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.mkdirp not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        mkdirs() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.mkdirs not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        move() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.move not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        outputFile() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.outputFile not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        outputJson() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.outputJson not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        pathExists() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.pathExists not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        readJson() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.readJson not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },

        remove() {
            return new Promise((resolve, reject) => {
                fs.rm(path, { recursive: true, force: true }, err => {
                    if (err) return reject(err)
                    resolve()
                })
            })
        },

        writeJson() {
            return new Promise((resolve, reject) => {
                throw 'fs-extra.promises.writeJson not implemented yet'
                try {

                } catch (err) {
                    throw err
                }
            })
        },
    }
}

for (var funcName in fs) {
    if (funcName === 'promises') continue
    __fs_extra[funcName] = fs[funcName]
}

for (var funcName in fs.promises) {
    __fs_extra.promises[funcName] = fs.promises[funcName]
}

module.exports = __fs_extra