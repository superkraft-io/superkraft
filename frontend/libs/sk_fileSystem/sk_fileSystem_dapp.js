var sk_filesystem = {
    openDialog: (opt = {})=>{
        return new Promise(async (resolve, reject) => {
            var properties = [
                (opt.directories ? 'openDirectory' : 'openFile')
            ]

            if (opt.multiple) properties.push('multiSelections')

            var res = await dialog.showOpenDialog(win, {
                properties: properties,
                filters: opt.filters
            })

            if (res.canceled) return reject()

            resolve((opt.multiple ? res.filePaths : res.filePaths[0]))
        })
    }
}
