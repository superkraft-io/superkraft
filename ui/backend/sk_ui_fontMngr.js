var fs = require('fs')

module.exports = class SK_UI_FontManager {
    constructor(opt){
        this.opt = opt
        this.sk = opt.sk
    }

    init(){
        var fontInfo = this.sk.ui.font
        if (!fontInfo) return

        console.error(`WARNING! Some fonts cause INCREDIBLY SIGNIFICANT slowdown of repaint inside Safari browser, which results in extremely slow and choppy scrolling in page and elements. Default fonts seem to work fine.`)

        var fontRoot = (this.sk.paths.root + 'sk_font/').split('\\').join('/')
        var frontendPath = fontRoot + 'frontend/'
        try { fs.mkdirSync(fontRoot) } catch(err) { }
        try { fs.mkdirSync(frontendPath) } catch(err) { }

        this.opt.parent.paths.font = fontRoot
        this.opt.parent.paths.frontend.font = frontendPath
        this.opt.parent.routes.font = '/sk_ui_font/'

        try { fs.mkdirSync(fontPath) } catch(err) { }

        var formattedFontName = fontInfo.name.toLowerCase().split(' ').join('_')


        var fontSelector = `
@font-face {
    font-family: "<name>";
    src: url("${frontendPath}<formattedFontName>/<weight>.ttf") format("truetype");
    font-weight: <weight>;
    font-style: normal;
}

`





        var fullCSS = ''
        if (sk.app_type === 'dapp'){

            var addField = weight => {
                fullCSS += '\n' + fontSelector
                .split('<name>').join(fontInfo.name)
                .split('<formattedFontName>').join(formattedFontName)
                .split('<weight>').join(weight)
            }

        
            for (var _s in fontInfo.weights){
                var style = fontInfo.weights[_s]
                for (var i in style) addField(style[i])
            }
        }

        fullCSS += `body { font-family: '${fontInfo.name}', sans-serif !important; }`

        fs.writeFileSync(frontendPath + 'sk_ui_font.css', fullCSS)


        

        var styles = []
        if (fontInfo.weights.normal) styles.push('0,' + fontInfo.weights.normal.join(';0,'))
        if (fontInfo.weights.italic) styles.push('1,' + fontInfo.weights.italic.join(';1,'))
        var weightsFormatted = styles.join(';')
      
        if (weightsFormatted.length > 0){
            var ejs = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${fontInfo.name.split(' ').join('+')}:ital,wght@${weightsFormatted}&display=swap" rel="stylesheet">
`

            fs.writeFileSync(fontRoot + 'sk_ui_font.ejs', ejs)
        }


    }
}