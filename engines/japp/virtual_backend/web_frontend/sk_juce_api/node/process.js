module.exports = {
    get env() { return sk_juce_api.fetch('node/process', { func: 'env' }) },
}