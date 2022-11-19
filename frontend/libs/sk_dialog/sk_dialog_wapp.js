var sk_dialog = {
    open: (opt = {})=>{
        return new Promise((resolve, reject)=>{
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
            

            var removeInput = ()=>{
                try { document.body.removeChild(input) } catch(err) {}
            }

            var cancelListener = async ()=>{
                await sk.utils.sleep(200)
                
                if (input.files.length > 0) return

                reject()
                removeInput()
            }

            input.onchange = async res => {
                resolve(input.files)
                
                window.removeEventListener('focus', cancelListener)
                window.removeEventListener('touchend', cancelListener)
                removeInput()
            }

            window.addEventListener('focus', cancelListener, { once: true })
            window.addEventListener('touchend', cancelListener, { once: true })

            
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
