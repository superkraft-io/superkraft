class SK_Application {
    constructor(opt) {
    }

    async init() {
    }

    get mode() { return sk_juce_api.staticInfo.application.mode }
    get name() { return sk_juce_api.staticInfo.application.name }
    get version() { return sk_juce_api.staticInfo.application.version }
}

var __sk_application = new SK_Application()

module.exports = __sk_application