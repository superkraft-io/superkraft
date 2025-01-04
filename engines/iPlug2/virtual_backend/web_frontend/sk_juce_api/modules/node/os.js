module.exports = {
    EOL: sk_juce_api.staticInfo.machine.EOL,

    availableParallelism() {
        return sk_juce_api.fetch('sk/machine', {func: 'getCPUInfo'}).coreCount
    },

    arch() {
        return sk_juce_api.staticInfo.machine.arch
    },

    constants: '',

    cpus() {
        return sk_juce_api.fetch('sk/machine', {func: 'getCPUInfo'}).cores
    },

    devNull: sk_juce_api.staticInfo.machine.devNull,

    endianness() {
        return sk_juce_api.staticInfo.machine.endianess
    },


    /* memory */

    meminfo() {
        return sk_juce_api.fetch('sk/machine', {func: 'getMemoryInfo'})
    },

    totalmem() {
        return sk_juce_api.fetch('sk/machine', {func: 'getMemoryInfo'}).physical.total
    },

    freemem() {
        return sk_juce_api.fetch('sk/machine', {func: 'getMemoryInfo'}).physical.free
    },

    usedmem() {
        return sk_juce_api.fetch('sk/machine', { func: 'getMemoryInfo' }).physical.used
    },

    



    uptime() {
        return sk_juce_api.fetch('sk/machine', {func: 'getMachineTime'}).uptime
    },




    getPriority(pid) {
        //IPC call
    },


    setPriority(pid, priority) {
        //IPC call
    },



    /* paths */

    homedir() {
        return sk_juce_api.staticInfo.machine.homedir
    },

    tmpdir() {
        return sk_juce_api.staticInfo.machine.tmpdir
    },


    /* machine */

    hostname() {
        return sk_juce_api.staticInfo.machine.hostname
    },

    loadavg() {
        //IPC call
    },


    /* operating system */

    version() {
        return sk_juce_api.staticInfo.machine.version
    },

    platform() {
        return sk_juce_api.staticInfo.machine.platform
    },

    release() {
        return sk_juce_api.staticInfo.machine.release
    },

    machine() {
        return sk_juce_api.staticInfo.machine.machine
    },

    type() {
        return sk_juce_api.staticInfo.machine.type
    },



    /* network */

    networkInterfaces() {
        return sk_juce_api.fetch('sk/machine', {func: 'getNetworInfo'}).interfaces
    },

    

    

    

    



    userInfo(options) {
        return sk_juce_api.fetch('sk/machine', {func: 'getUserInfo'})
    }
}
