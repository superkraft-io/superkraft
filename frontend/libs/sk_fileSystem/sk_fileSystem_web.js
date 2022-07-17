var sk_filesystem = {
    openDialog: opt => {
        return new Promise(resolve => {
            var fileSelectBucket = JSOM.parse({root: document.body, tree: {
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
            fileSelectBucket.fileSelect.click()
        })
    }
}
