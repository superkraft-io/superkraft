class SK_Commands {
    constructor(opt){
        this.commands = {}

        this.capturedShortcut = []


        this.__captureKeyboardEvents()
    }

    add(opt){
        this.commands[opt.name] = opt
        this[opt.name] = opt.action
    }

    __captureKeyboardEvents(){
        document.addEventListener('keydown', _e => {
            // ... (existing code for target and suo checks)
            var target = _e.target
            if (target.nodeName === 'INPUT') return
            var suo = target.sk_ui_obj
            if(suo && suo.interceptKeyboard) return

            
            this.capturedShortcut = []

            if (_e.ctrlKey  ) this.capturedShortcut.push('ctrl')
            if (_e.metaKey  ) this.capturedShortcut.push('cmd') // Note: metaKey is usually a boolean, check context if this is intentional
            if (_e.altKey   ) this.capturedShortcut.push('alt')
            if (_e.shiftKey ) this.capturedShortcut.push('shift')

            // --- Start of modifications for function keys ---
            var key = _e.key
            
            // Check if the key is a function key (F1 through F12 or more)
            var isFunctionKey = key.startsWith('F') && key.length > 1 && !isNaN(parseInt(key.substring(1)))

            var ignoreKeys = ['control', 'meta', 'alt', 'shift']
            
            if (!ignoreKeys.includes(key.toLowerCase())) {
                // Convert to lowercase *after* checking ignoreKeys, 
                // but keep the function key capitalization logic for clarity if needed, 
                // though to match your existing logic, we'll just use lowercased key.
                
                // For function keys, keep them as 'f1', 'f2', etc.
                // For other keys, apply the existing lowercase logic.
                
                this.capturedShortcut.push(key.toLowerCase())
            }

            // --- End of modifications ---
            
            // ... (existing code for fixLastChar and loop)

            var fixLastChar = ()=>{
                var replacements = {
                    '_': '-',
                    ';': ',',
                    ':': '.'
                }
                
                var lastChar = this.capturedShortcut[this.capturedShortcut.length - 1]
                var replacement = replacements[lastChar]

                // We must skip replacement for function keys like 'f1'
                if (isFunctionKey) return 

                if (replacement) this.capturedShortcut[this.capturedShortcut.length - 1] = replacement
            }

            fixLastChar()
            

            for (var cmdName in this.commands){
                var cmd = this.commands[cmdName]
                if (!cmd.shortcut) continue
                
                var cmdShortcut = cmd.shortcut
                if (typeof cmdShortcut === 'object') cmdShortcut = (sk.os === 'macos' ? cmd.shortcut.macos : cmd.shortcut.win)
                
                cmdShortcut = cmdShortcut.toLowerCase()

                if (this.compareShortcuts(cmdShortcut.split('+'), this.capturedShortcut)){
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