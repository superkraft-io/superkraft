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

            var target = _e.target
            if (target.nodeName === 'INPUT') return
            var suo = target.sk_ui_obj
            if(suo && suo.interceptKeyboard) return

            var capturedShortcut = []
            if (_e.ctrlKey) capturedShortcut.push('ctrl')
            if (_e.metaKey === '') capturedShortcut.push('cmd')
            if (_e.altKey) capturedShortcut.push('alt')
            if (_e.shiftKey) capturedShortcut.push('shift')

            var key = _e.key.toLowerCase()
            var ignoreKeys = ['control', 'meta', 'alt', 'shift']
            if (!ignoreKeys.includes(key)) capturedShortcut.push(key)
            
            

            
            var fixLastChar = ()=>{
                var replacements = {
                    '_': '-',
                    ';': ',',
                    ':': '.'
                }
                
                var lastChar = capturedShortcut[capturedShortcut.length - 1]
                var replacement = replacements[lastChar]

                if (replacement) capturedShortcut[capturedShortcut.length - 1] = replacement
            }

            fixLastChar()



            //var shortcut =  arr.join('+')
            
            for (var cmdName in this.commands){
                var cmd = this.commands[cmdName]
                if (!cmd.shortcut) continue
                
                var cmdShortcut = cmd.shortcut
                if (typeof cmdShortcut === 'object') cmdShortcut = (sk.os === 'macos' ? cmd.shortcut.macos : cmd.shortcut.win)
                
                cmdShortcut = cmdShortcut.toLowerCase()

                if (this.compareShortcuts(cmdShortcut.split('+'), capturedShortcut)){
                    _e.preventDefault()
                    _e.stopPropagation()
                    cmd.action()
                }
            }
        })
    }

    compareShortcuts(a, b){
        if (a.length !== b.length) return
        
        for (var _a in a) if (!b.includes(a[_a])) return

        return true
    }
}