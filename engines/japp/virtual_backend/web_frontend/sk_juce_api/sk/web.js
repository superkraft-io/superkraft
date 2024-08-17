var sk_web_ipc_call = async (func, data = {}, onProgress) => {
    var callbackTimer = undefined
    var progressCallbackID = undefined

    if (onProgress) {
        var interval = opt.interval || 1000
        if (interval < 0)

        var cbRes = await window.sk_ipc.ipc.request('sk:web', { func: 'createProgressCallback' })
        progressCallbackID = cbRes.progressCallbackID

        var again = true
        var callbackTimer = setInterval(async () => {
            if (again) return
            again = false
            progressRes = await window.sk_ipc.ipc.request('sk:web', { func: 'getProgress', id: cbRes.progressCallbackID })
            onProgress(progressRes)
            again = true
        })
    }


    var res = await window.sk_ipc.ipc.request('sk:web', { ...{ func: func, progressCallbackID: progressCallbackID }, ...data })

    clearInterval(callbackTimer)

    return res
}

module.exports = {
    get: (opt, onProgress) => {
        var defOpts = {
            url: '',
            headers: '',
            timeout: 7000,
            redirects: 5
        }
        defOpts = { ...defOpts, ...opt }

        sk_web_ipc_call('get', defOpts, onProgress)
    },

    post: (opt, onProgress) => {
        var defOpts = {
            url: '',
            headers: '',
            timeout: 7000,
            redirects: 5
        }
        defOpts = { ...defOpts, ...opt }

        sk_web_ipc_call('post', defOpts, onProgress)
    },

    download: (opt, onProgress) => {
        var defOpts = {
            url: '',
            headers: '',
            timeout: 7000,
            redirects: 5
        }
        defOpts = { ...defOpts, ...opt }

        if (onProgress) {

        }

        sk_web_ipc_call('download', defOpts, onProgress)
    }
}