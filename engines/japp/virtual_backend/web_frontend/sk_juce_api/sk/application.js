module.exports = class SK_Application {
    constructor(opt) {
    }

    async init() {
        this.mode = sk_juce_api.staticInfo.application.mode
        this.name = sk_juce_api.staticInfo.application.name
        this.version = sk_juce_api.staticInfo.application.version
    }
}