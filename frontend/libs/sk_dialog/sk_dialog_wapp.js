var sk_dialog = {
    open: (opt = {})=>{
        return new Promise((resolve, reject)=>{
            var resolved = false

            var input = document.createElement('input')
            input.type = 'file';
            Object.assign(input.style, {
                position: 'fixed',
                left: '-9999px',
                top: '-9999px',
                width: '0',
                height: '0',
                opacity: '0',
                pointerEvents: 'none',
            });

            var attrs = {
                webkitdirectory: '',
                directory: '',
                accept: opt.filters,
                multiple: ''
            }

            if (!opt.directories){
                delete attrs.webkitdirectory
                delete attrs.directory
            }

            if (!opt.filters) delete attrs.accept
            if (!opt.multiple) delete attrs.multiple
                
            for (var key in attrs) input.setAttribute(key, attrs[key])
            

            document.body.appendChild(input);

            var removeInput = ()=>{
                try { document.body.removeChild(input) } catch(err) {}
            }

            var doResolve = ()=>{
                if (resolved) return

                resolved = true
                resolve(input.files)
                
                window.removeEventListener('focus', cancelListener)
                window.removeEventListener('touchend', cancelListener)
                removeInput()
            }

            var cancelListener = async (sender)=>{
                reject()
                removeInput()
            }

            input.onchange = async res => {
                doResolve()
            }

            input.addEventListener('cancel', ()=>{ cancelListener('cancel') }, { once: true });

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
