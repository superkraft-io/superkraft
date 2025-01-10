module.exports = class SKXX_NativeActions_Loader {
    constructor(){

    }

    async listNativeActions(){
        var actions = []

        try {
            var entries = await sk_fs.promises.readdir(this.sk.paths.nativeActions, true)

            for (var i in entries) {
                var entry = entries[i]
                if (!entry.type === 2) continue

                var name = entry.name
                

                if (accessRes) actions.push(name)
            }

            return actions
        } catch (err) {
            return {}
        }
    }
}