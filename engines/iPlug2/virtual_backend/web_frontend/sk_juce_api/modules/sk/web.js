var sk_web_ipc_call = async (func, payload = {}, onProgress) => {
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

    var res = undefined
    try {
        var defPayload = {
            url: '',
            headers: {},
            timeout: 7000,
            redirects: 5
        }
        defPayload = { ...defPayload, ...payload }

        defPayload.body = JSON.stringify(defPayload.body)


        
        var headersArr = []
        for (var headerName in defPayload.headers) {
            var headerValue = defPayload.headers[headerName]
            headersArr.push(headerName + ': ' + headerValue)
        }
        defPayload.headers = headersArr.join('<!-!>')


        res = await window.sk_ipc.ipc.request('sk:web', { ...{ func: func, progressCallbackID: progressCallbackID }, ...defPayload })

    } catch (err) {
        res = err
    }

    clearInterval(callbackTimer)

    return res
}

module.exports = {
    get: (opt, onProgress) => {
        return sk_web_ipc_call('get', opt, onProgress)
    },

    post: (opt, onProgress) => {
        return sk_web_ipc_call('post', opt, onProgress)
    },

    download: (opt, onProgress) => {
    }
}