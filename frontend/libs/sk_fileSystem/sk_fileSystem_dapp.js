var sk_filesystem = {
    openDialog: (opt = {})=>{
        return new Promise(async (resolve, reject) => {
            var properties = [
                (opt.directories ? 'openDirectory' : 'openFile')
            ]

            if (opt.multiple) properties.push('multiSelections')
            if (opt.dontAddToRecent) properties.push('dontAddToRecent')

            var res = await dialog.showOpenDialog(win, {
                title: opt.title,
                properties: properties,
                filters: opt.filters,
                buttonLabel: opt.buttonLabel,
                message: opt.message
            })

            if (res.canceled) return reject()

            resolve((opt.multiple ? res.filePaths : res.filePaths[0]))
        })
    },

    saveDialog: (opt = {})=>{
        return new Promise(async (resolve, reject) => {
            var properties = []

            if (opt.multiple) properties.push('multiSelections')
            if (opt.dontAddToRecent) properties.push('dontAddToRecent')

            var res = await dialog.showSaveDialog(win, {
                title: opt.title,
                properties: properties,
                filters: opt.filters,
                buttonLabel: opt.buttonLabel,
                message: opt.message
            })

            if (res.canceled) return reject()

            resolve(res.filePath)
        })
    }
}
