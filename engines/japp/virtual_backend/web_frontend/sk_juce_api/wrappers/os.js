var _sk_os_def = {
    EOL: '\n',

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

    devNull: '',

    endianness() {
        return sk_juce_api.machineInfo.endianess
    },

    freemem() {
        return sk_juce_api.fetch('sk.getMemoryInfo').free
    },

    getPriority(pid) {
        //IPC call
    },

    homedir() {
        return sk_juce_api.machineInfo.homedir
    },

    hostname() {
        return sk_juce_api.machineInfo.hostname
    },

    loadavg() {
        //IPC call
    },

    machine() {
        return sk_juce_api.machineInfo.machine
    },

    networkInterfaces() {
        return sk_juce_api.fetch('sk.getNetworInfo').interfaces
    },

    platform() {
        return sk_juce_api.machineInfo.platform
    },

    release() {
        return sk_juce_api.machineInfo.release
    },

    setPriority(pid, priority) {
        //IPC call
    },

    tmpdir() {
        return sk_juce_api.machineInfo.tmpdir
    },

    totalmem() {
        return sk_juce_api.fetch('sk.getMemoryInfo').total
    },

    type() {
        return sk_juce_api.machineInfo.type
    },

    uptime() {
        return sk_juce_api.fetch('sk.getMachineTime').uptime
    },

    userInfo(options) {

    },

    version() {
        return sk_juce_api.machineInfo.version
    }
}

module.exports = _sk_os_def