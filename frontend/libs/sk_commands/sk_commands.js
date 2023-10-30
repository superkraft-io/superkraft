class SK_Commands {
    constructor(opt){
        this.commands = {}

        this.__captureKeyboardEvents()
    }

    add(opt){
        this.commands[opt.name] = opt
        this[opt.name] = opt.action
    }

    __captureKeyboardEvents(){
        document.addEventListener('keydown', _e => {
            var arr = []
            if (_e.ctrlKey) arr.push('ctrl')
            if (_e.metaKey === '') arr.push('cmd')
            if (_e.altKey) arr.push('alt')
            if (_e.shiftKey) arr.push('shift')

            var key = _e.key.toLowerCase()
            var ignoreKeys = ['control', 'meta', 'alt', 'shift']
            if (!ignoreKeys.includes(key)) arr.push(key)
            
            

            
            var fixLastChar = ()=>{
                var replacements = {
                    '_': '-',
                    ';': ',',
                    ':': '.'
                }
                
                var lastChar = arr[arr.length - 1]
                var replacement = replacements[lastChar]

                if (replacement) arr[arr.length - 1] = replacement
            }

            fixLastChar()


            console.log(arr)

            var shortcut =  arr.join('+')
            
            for (var cmdName in this.commands){
                var cmd = this.commands[cmdName]
                
                

                var cmdShortcut = cmd.shortcut
                if (typeof cmdShortcut === 'object') cmdShortcut = (sk.os === 'macos' ? cmd.shortcut.macos : cmd.shortcut.win)
                if (cmdShortcut === shortcut){
                    _e.preventDefault()
                    _e.stopPropagation()
                    cmd.action()
                }
            }
        })
    }
}