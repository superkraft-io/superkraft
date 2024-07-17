sk_juce_api.path = {
    dirname(path) {
        var split = this.unixify(path).split('/')
        split.splice(split.length - 1, 1)
        return split.join('/')
    },

    extname(path) {
        var split = path.split('.')
        return '.' + split[split.length - 1]
    },

    unixify(path) {
        return path.split('\\\\').join('\\').split('\\').join(' / ')
    },
}

try { module.exports = sk_juce_api.path } catch (err) { }