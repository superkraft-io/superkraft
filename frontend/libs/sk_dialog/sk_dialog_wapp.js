var sk_dialog = {
    open: (opt = {})=>{
        return new Promise(resolve => {
            var input = document.createElement('input')
            input.setAttribute('type', 'file')
            input.style.display = 'none'

            var attrs = {
                webkitdirectory: '',
                directory: '',
                accepts: opt.filters,
                multiple: ''
            }

            if (!opt.directories){
                delete attrs.webkitdirectory
                delete attrs.directory
            }

            if (!opt.filters) delete attrs.accepts
            if (!opt.multiple) delete attrs.multiple
                
            for (var key in attrs) input.setAttribute(key, attrs[key])
            
            input.onchange = res => {
                resolve(input.files)
            }
            input.click()
        })
    },

    message(opt){
        return new Promise(async (resolve, reject) => {
            if (opt.native){
                if (confirm(opt.text) === true) resolve()
                else reject()
                return
            }
        })
    }
}
