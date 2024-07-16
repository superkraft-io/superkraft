var _sk_os_def = {
    EOL: sk_juce_api.machineInfo.EOL,

    availableParallelism() {
        return sk_juce_api.fetch('sk.getCPUInfo').coreCount
    },

    arch() {
        return sk_juce_api.machineInfo.arch
    },

    constants: '',

    cpus() {
        return sk_juce_api.fetch('sk.getCPUInfo').cores
    },

    devNull: sk_juce_api.machineInfo.devNull,

    endianness() {
        return sk_juce_api.machineInfo.endianess
    },


    /* memory */

    meminfo() {
        return sk_juce_api.fetch('sk.getMemoryInfo')
    },

    totalmem() {
        return sk_juce_api.fetch('sk.getMemoryInfo').physical.total
    },

    freemem() {
        return sk_juce_api.fetch('sk.getMemoryInfo').physical.free
    },

    usedmem() {
        return sk_juce_api.fetch('sk.getMemoryInfo').physical.used
    },

    



    uptime() {
        return sk_juce_api.fetch('sk.getMachineTime').uptime
    },




    getPriority(pid) {
        //IPC call
    },


    setPriority(pid, priority) {
        //IPC call
    },



    /* paths */

    homedir() {
        return sk_juce_api.machineInfo.homedir
    },

    tmpdir() {
        return sk_juce_api.machineInfo.tmpdir
    },


    /* machine */

    hostname() {
        return sk_juce_api.machineInfo.hostname
    },

    loadavg() {
        //IPC call
    },


    /* operating system */

    version() {
        return sk_juce_api.machineInfo.version
    },

    platform() {
        return sk_juce_api.machineInfo.platform
    },

    release() {
        return sk_juce_api.machineInfo.release
    },

    machine() {
        return sk_juce_api.machineInfo.machine
    },

    type() {
        return sk_juce_api.machineInfo.type
    },



    /* network */

    networkInterfaces() {
        return sk_juce_api.fetch('sk.getNetworInfo').interfaces
    },

    

    

    

    



    userInfo(options) {
        return sk_juce_api.fetch('sk.getUserInfo')
    }
}

module.exports = _sk_os_def