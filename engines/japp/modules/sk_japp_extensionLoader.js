module.exports = class SK_JAPP_NativeActions_Loader {
    constructor(){

    }

    async listExtensions(){
        var actions = []

        try {
            var entries = await sk_fs.promises.readdir(this.sk.paths.nativeActions, true)

            for (var i in entries) {
                var entry = entries[i]
                if (!entry.type === 2) continue

                var name = entry.name
                

                if (accessRes) extensions.push(name)
            }

            return extensions
        } catch (err) {
            return {}
        }
    }
}