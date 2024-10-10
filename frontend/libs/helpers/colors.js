class SK_UI_Helpers_Color {
    constructor(){

        this.hslRegex = /hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?(?:,\s*[\d.]+)?\)/
        this.rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
        this.hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$|^#([A-Fa-f0-9]{4}){1,2}$/
    }

    isHSL(clr){ return this.hslRegex.test(clr) }
    isRGB(clr){ return this.rgbRegex.test(clr) }
    isHEX(clr){ return this.hexRegex.test(clr) }
    isRGB_Components(clr){ if (clr.r !== undefined && clr.g !== undefined  && clr.b !== undefined) return true }
    isCSS(clr){
        var clr = this.cssToRGB(clr)
        return clr
    }

    colorType(clr){
             if (this.isHSL(clr)) return 'hsl'
        else if (this.isRGB(clr)) return 'rgb'
        else if (this.isHEX(clr)) return 'hex'
        else if (this.isRGB_Components(clr)) return 'rgb_components'
        else if (this.isCSS(clr)) return 'css'
    }

    rgbComponents(clr){
        var clrType = this.colorType(clr)

        if (clrType === 'rgb_components') return clr
        if (clrType === 'css') return this.cssToRGB(clr)

        try {
            return this[clrType + 'ToRGB'](clr)
        } catch(err) {
            throw err
        }
    }

    cssToRGB(cssClrDefinition){
        if (cssClrDefinition === 'black') return {r: 0, g: 0, b: 0, a: 1}
        if (cssClrDefinition === 'transparent') return {r: 0, g: 0, b: 0, a: 0}

        const tempElement = document.createElement('div')
        tempElement.style.color = cssClrDefinition
        document.body.appendChild(tempElement)
        const computedColor = getComputedStyle(tempElement).color
        document.body.removeChild(tempElement)

        var rgb = this.rgbToRGB(computedColor)

        return rgb
      }

    perceivedLightness(clr) {
        var rgb = clr
        var luma = undefined
        try {
            rgb = this.rgbComponents(clr)
        } catch(err){
            var x = 0
        }

        try {
            luma = (rgb.r * 0.2126 + rgb.g * 0.7152 + rgb.b * 0.0722) / 255;
        } catch(err){
            throw 'Could not calculate '
        }
        
        return luma;
    }

    rgbToRGB(clrStr){
        var rgbMatch = clrStr.match(this.rgbRegex)
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3]),
                a: parseFloat(rgbMatch[4] || 1),
                
            };
        }
    }

    rgbToHEX(rgb){
        try {
            return `#${
            rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
            .slice(1)
            .map(n => 
                parseInt(n, 10)
                .toString(16)
                .padStart(2, '0'))
                .join('')
            }`
        } catch(err) { return }
    }

    hexToRGB(hex, alpha){
        var _hex = hex
        try {if (_hex[0] === '#') _hex = _hex.substr(1,16)} catch(err){}

        const r = parseInt(_hex.slice(0, 2), 16);
        const g = parseInt(_hex.slice(2, 4), 16);
        const b = parseInt(_hex.slice(4, 6), 16);
        const a = parseInt(_hex.slice(6, 8), 16) / 255 || 1;
      
        var obj = {r: r, g: g, b: b, a}

        return obj
    }

    rgbToHSL(r, g, b){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return ({
            h: h,
            s: s,
            l: l,
        });
    }

    hslToRGB(hue, saturation, lightness) {
        // Convert saturation and lightness from percentages to fractions
        saturation /= 100;
        lightness /= 100;

        // Calculate chroma (the difference between the max and min RGB values)
        const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = lightness - chroma / 2;

        let r = 0, g = 0, b = 0, a = 1;

        if (0 <= hue && hue < 60) {
            r = chroma; g = x; b = 0;
        } else if (60 <= hue && hue < 120) {
            r = x; g = chroma; b = 0;
        } else if (120 <= hue && hue < 180) {
            r = 0; g = chroma; b = x;
        } else if (180 <= hue && hue < 240) {
            r = 0; g = x; b = chroma;
        } else if (240 <= hue && hue < 300) {
            r = x; g = 0; b = chroma;
        } else if (300 <= hue && hue < 360) {
            r = chroma; g = 0; b = x;
        }

        // Convert RGB values to the 0-255 range
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return { r, g, b, a}
    }

    hslToHEX(hue, saturation, lightness) {
        // Convert saturation and lightness from percentages to fractions
        saturation /= 100;
        lightness /= 100;

        // Calculate chroma
        const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
        const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = lightness - chroma / 2;

        let r = 0, g = 0, b = 0;

        if (0 <= hue && hue < 60) {
            r = chroma; g = x; b = 0;
        } else if (60 <= hue && hue < 120) {
            r = x; g = chroma; b = 0;
        } else if (120 <= hue && hue < 180) {
            r = 0; g = chroma; b = x;
        } else if (180 <= hue && hue < 240) {
            r = 0; g = x; b = chroma;
        } else if (240 <= hue && hue < 300) {
            r = x; g = 0; b = chroma;
        } else if (300 <= hue && hue < 360) {
            r = chroma; g = 0; b = x;
        }

        // Convert to RGB values in the 0-255 range
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        // Convert RGB to hex
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    colorBrightness(color, amount) {
        const calc = (sub1,sub2)=> Math.min(255,Math.floor(parseInt(color.substr(sub1,sub2),16)*amount)).toString(16).padStart(2,"0")
        return `#${calc(1,2)}${calc(3,2)}${calc(5,2)}`
    }

    colorContrast(hexcolor){
        // If a leading # is provided, remove it
        if (hexcolor.slice(0, 1) === '#') hexcolor = hexcolor.slice(1)

        // If a three-character hexcode, make six-character
        if (hexcolor.length === 3){
            hexcolor = hexcolor.split('').map(function (hex) {
                return hex + hex
            }).join('')
        }

        // Convert to RGB value
        var r = parseInt(hexcolor.substr(0,2),16)
        var g = parseInt(hexcolor.substr(2,2),16)
        var b = parseInt(hexcolor.substr(4,2),16)

        // Get YIQ ratio
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000

        // Check contrast
        return (yiq >= 128) ? 'black' : 'white'
    }

    shouldUseBlackText(color, threshold = 0.5) {
        const rgb = this.rgbComponents(color) // Convert any color format to RGB
        const perceivedLightness = this.perceivedLightness(rgb);
        return perceivedLightness > threshold;  // Return true for black, false for white
    }
}