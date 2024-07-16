module.exports = class SK_SAPP_ExtensionLoader {
    constructor(){

    }

    async listExtensions(){
        var extensions = []

        var entries = await sk_fs.promises.readdir(this.sk.paths.extensions, true)

        for (var i in entries){
            var entry = entries[i]
            if (!entry.type === 2) continue

            var name = entry.name
            var mainPath = this.sk.paths.extensions + name + '/main.cc'

            var accessRes = await sk_fs.promises.access(mainPath)

            if (accessRes) extensions.push(name)
        }

        return extensions
    }
}