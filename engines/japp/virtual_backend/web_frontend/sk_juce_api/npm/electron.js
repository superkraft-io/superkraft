var sk_nodejs_electronjs_ipc_call = (func, data = {})=>{
    sk_juce_api.ipc_call('node:electronjs', { ...{func: func}, ...data })
}

module.exports = {
    shell: {
        showItemInFolder(fullPath){
            sk_nodejs_electronjs_ipc_call('showItemInFolder', { path: fullPath })
        },

        openPath(path) {
            sk_nodejs_electronjs_ipc_call('openPath', { path: path })
        },

        openExternal(url, options) {
            sk_nodejs_electronjs_ipc_call('openExternal', { url: url, options: options })
        },

        trashItem(path) {
            sk_nodejs_electronjs_ipc_call('trashItem', { path: path })
        },

        beep() {
            sk_nodejs_electronjs_ipc_call('beep')
        },

        writeShortcutLink(shortcutPath, operation, options) {
            sk_nodejs_electronjs_ipc_call('writeShortcutLink', { path: shortcutPath, operation: operation, options: options })
        },

        readShortcutLink(shortcutPath) {
            sk_nodejs_electronjs_ipc_call('readShortcutLink', { path: shortcutPath })
        }
    }
}