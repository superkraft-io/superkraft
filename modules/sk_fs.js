var __fs = undefined


module.exports = class SK_FS {
    constructor(opt){
        var fsTypes = {
            wapp: this.SK_FS_Promises_Standard(),
            dapp: this.SK_FS_Promises_Standard(),
            sapp: SK_FS_Promises_SAPP,
        }

        try { this.promises = new fsTypes[opt.app_type](this) } catch(err) {}

        window.fs = this
    }
    
    async init(){
        if (this.promises.init) this.promises.init()
    }


    SK_FS_Promises_Standard(){
        this.promises = require('fs/promises')
    }
}

class SK_FS_Promises_SAPP {
    constructor(parent){
        __fs = require('fs')

        this.parent = parent
    }

    init(){
    }

    async access(path){
        //if (path.indexOf('.ejs') > -1) return true
        try {
            var res = await __fs.promises.access(new URL(path).pathname.slice(1))
            return true
        } catch(err) {
            //console.error(err)
            return false
        }
    }

    stat(path){
        return new Promise(async (resolve, reject)=>{
            try {
                resolve(await __fs.promises.stat(new URL(path).pathname.slice(1)))
            } catch(err) {
                //console.error(err)
                reject(err)
            }
        })
    }

    writeFile(path, data){
        return new Promise(async (resolve, reject)=>{
            try {
                resolve(await __fs.promises.writeFile(new URL(path).pathname.slice(1), data))
            } catch(err) {
                //console.error(err)
                reject(err)
            }
        })
    }

    readFile(path){
        return new Promise(async (resolve, reject)=>{
            try {
                resolve(await __fs.promises.readFile(new URL(path).pathname.slice(1)))
            } catch(err) {
                //console.error(err)
                resolve(err)
            }
        })
    }

    readdir(path){
        return new Promise(async (resolve, reject)=>{
            try {
                var res = await __fs.promises.readdir(new URL(path).pathname.slice(1))
                var list = []
                for (var i in res) list.push(res[i].name)
                resolve(list)
            } catch(err) {
                reject(err)
            }
        })
    }

    async readJSON(path){
        return JSON.parse(await __fs.promises.readFile(new URL(path).pathname.slice(1)))
    }

    async writeJSON(path, data){
        return JSON.parse(await __fs.promises.writeFile(new URL(path).pathname.slice(1), JSON.stringify(data)))
    }
}
