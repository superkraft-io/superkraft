sk_juce_api.path = {
    extname: path => {
        var split = path.split('.')
        return split[split.length - 1]
    },

    unixPath(path) {
        return path.split('\\\\').join('\\').split('\\').join(' / ')
    },

    reformatPath(path) {
        var unixPath = this.unixPath(path)
        var split = path.split('/')

        var arr = []
        for (var i = 0; i < split.length; i++) {
            var part = split[i]

            if (part == '..') {
                arr.splice(arr.length - 1, 1)
            } else {
                arr.push(part)
            }


        }

        var newPath = arr.join('/')

        return newPath
    }
}

try { module.exports = sk_juce_api.path } catch (err) { }