var sk_dialog = {
    open: (opt = {})=>{
        return new Promise(async (resolve, reject) => {
            var properties = [
                (opt.directories ? 'openDirectory' : 'openFile')
            ]

            if (opt.multiple) properties.push('multiSelections')
            if (opt.dontAddToRecent) properties.push('dontAddToRecent')

            var defOpts = {
                title: opt.title,
                properties: properties,
                filters: opt.filters,
                buttonLabel: opt.buttonLabel,
                message: opt.message
            }
            var res = await sk.comm.main('dialog', {type: 'open', options: defOpts})
            

            if (res.canceled) return reject()

            resolve((opt.multiple ? res.filePaths : res.filePaths[0]))
        })
    },

    save: (opt = {})=>{
        return new Promise(async (resolve, reject) => {
            
            
            var properties = []

            if (opt.multiple) properties.push('multiSelections')
            if (opt.dontAddToRecent) properties.push('dontAddToRecent')

            var res = await sk.comm.main('dialog', {type: 'save', options: opt})
            

            if (res.canceled) return reject()

            resolve(res.filePath)
        })
    },

    message(opt){
        return new Promise(async (resolve, reject) => {
            if (opt.native){
                var res = await sk.comm.main('dialog', {type: 'message', settings: opt})
                return resolve(res)
            }
            
            //show SK modal with opt formatting
        })
    }
}

