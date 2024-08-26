window.__JUCE__.backend.addEventListener('sk.processEventListener', res => {
    const event = new CustomEvent(res.eventName, res.data)
    window.dispatchEvent(event)
})

module.exports = {
    on: (eventName, cb) => { window.addEventListener(eventName, cb) },
    off: (eventName, cb) => { window.removeEventListener(eventName, cb) },

    get env() { return sk_juce_api.fetch('node/process', { func: 'env' }) },

    abort: () => {
    },


    get allowedNodeEnvironmentFlags() { return },

    get arch() { return sk_juce_api.staticInfo.machine.arch },

    get argv() { return sk_juce_api.staticInfo.application.argv },
    get argv0() { return sk_juce_api.staticInfo.application.argv0 },

    channel: {
        ref(){

        },

        unref(){

        }
    },

    chdir(directory) {
        console.log('chdir')
        try {
            var res = sk_juce_api.fetch('node/process', { func: 'chdir', directory: directory })
            if (res.error) throw res.error
        } catch (err) {
            throw err
        }
    },
    get config() { },
    get connected() { },
    constrainedMemory() { },
    availableMemory() { },
    cpuUsage(previousValue) { },
    cwd() { },
    debugPort() { },
    disconnect() { },
    dlopen(module, filename, flags) { },
    emitWarning(warning, options, code, ctor) { },
    get execArgv() { },
    get execPath() { },
    exit(code) { },
    get exitCode() { },
    finalization: {
        register(ref, callback){ },
        registerBeforeExit(ref, callback){ },
        unregister(ref){ },
    },
    getActiveResourcesInfo() { },
    getBuiltinModule(id) { },
    getegid() { },
    geteuid() { },
    getgid() { },
    getgroups() { },
    getuid() { },
    hasUncaughtExceptionCaptureCallback() { },
    hrtime(time) {
        return {
            bigint() { },
        }
    },
    initgroups(user, extraGroup){ },
    kill(pid, signal){ },
    loadEnvFile(path){ },
    get mainModule(){ },
    memoryUsage(){
        return {
            rss: () => {

            }
        }
    },
    nextTick(callback){ },
    get noDeprecation(){ },
    get permission(){
        return {
            has(scope, reference) { },
        }
    },
    get pid(){ },
    get platform(){ },
    get ppid(){ },
    get release(){ },
    get report(){
        return {
            get compact() { },
            get directory() { },
            get filename() { },
            getReport(err) { },
            get reportOnFatalError() { },
            get reportOnSignal() { },
            get reportOnUncaughtException() { },
            get signal() { },
   
            writeReport(filename, err){ },

        }
    },
    resourceUsage(){ },
    send(message, sendHandle, options, callback){ },
    setegid(id){ },
    seteuid(id){ },
    setgid(id){ },
    setgroups(groups){ },
    setuid(id){ },
    setSourceMapsEnabled(val){ },
    setUncaughtExceptionCaptureCallback(fn){

    },
    get sourceMapsEnabled() { },
    get stderr(){
        return {
            get fd() {

            }
        }
    },
    get stdin(){
        return {
            get fd() {

            }
        }
    },
    get stdout(){
        return {
            get fd() {

            }
        }
    },
    get throwDeprecation(){ },
    get title(){ },
    get traceDeprecation(){ },
    umask(){ },
    umask(mask){ },
    uptime(){ },
    get version(){ },
    get versions(){ }
}