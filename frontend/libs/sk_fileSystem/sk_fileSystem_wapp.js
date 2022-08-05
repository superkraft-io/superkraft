var sk_filesystem = {
    openDialog: (opt = {})=>{
        return new Promise(resolve => {
            /*var fileSelectBucket = JSOM.parse({root: document.body, tree: {
                input_fileSelect: {
                    type: 'file',
                    style: 'display: none;',

                    events: {
                        change: () => {
                            var files = fileSelectBucket.fileSelect.files
                            fileSelectBucket.fileSelect.remove()
                            resolve(files)
                        }
                    }
                }
            }})
            fileSelectBucket.fileSelect.click()*/

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
    }
}
