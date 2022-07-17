var sk_communicator = {
    /*send: opt => {
        return new Promise((resolve, reject)=>{
            var defOpt = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(opt),
            }

            if (opt.files){
                //defOpt.headers = { 'Content-Type': 'multipart/form-data' }
                delete defOpt.headers
                
                formData = new FormData
                
                for (var i = 0; i < opt.files.length; i++) formData.append('file' + (i+1), opt.files[i])
                
                formData.append('cmd', opt.cmd)

                for (var key in opt.data) formData.append(key, opt.data)

                defOpt.body = formData
            }
            

            fetch('/' + opt.cmd, defOpt)
            .then(response => response.json())
            .then(res => {
                resolve(res)
            })
            .catch(error => {
                reject(error)
            })
        })
    }*/


    send: opt => {
        return new Promise((resolve, reject)=>{
            var isMultiForm = (opt.files ? true : false)

            var payload = (isMultiForm ? new FormData() : {})

            var formAdd = (key, value)=>{
                if (isMultiForm) payload.append(key, value)
                else payload[key] = value
            }
    
            if (opt.files){
                for (var i = 0; i < opt.files.length; i++) formAdd('file' + (i+1), opt.files[i])
                delete opt.files
            }

            if (opt.data){
                try { formAdd('data', (isMultiForm ? JSON.stringify(opt.data) : opt.data)) } catch(err) {}
            }
            
            delete opt.data
    
            for (var key in opt) formAdd(key, opt[key])
    
    
    
    
            var getTime = ()=>{
                var dt = new Date;
                return dt.getTime() / 1e3
            }
    
            var startTime = getTime()
            
            var getUploadProgress = function(e){
                var t = getTime();
                var r = t - startTime;
                var i = e.loaded / e.total;
                var a = r > 0 ? e.loaded / r : 0;
                var s = -1;
                var o = "";
                if (i > 0) {
                    s = parseInt((1 - i) * r / i, 10);
                    //o = this.getTextFromSeconds(s, 10)
                }
                return {
                    elapsedRaw: r,
                    //elapsedHuman: this.getTextFromSeconds(r),
                    amount: i,
                    percent: Math.floor(i * 100),
                    dataSentRaw: e.loaded,
                    //dataSentHuman: this.getTextFromBytes(e.loaded),
                    dataTotalRaw: e.total,
                    //dataTotalHuman: this.getTextFromBytes(e.total),
                    dataRateRaw: a,
                    //dataRateHuman: this.getTextFromBytes(a) + "/sec",
                    remainingTimeRaw: s,
                    //remainingTimeHuman: o,
                    originalEvent: e
                }
            }
    
    
            var req = new XMLHttpRequest()
            
            
            
            req.upload.addEventListener('progress', _e => {
                if (_e.lengthComputable) {
                    var progress = getUploadProgress(_e);
                    if (opt.onProgress) opt.onProgress(progress)
                }
            }, false)
    
            try {
                req.open('POST', opt.cmd, true)
                if (!isMultiForm) req.setRequestHeader('Content-Type', 'application/json')
                req.send((isMultiForm ? payload : JSON.stringify(payload)))

                req.onreadystatechange = ()=>{
                    if (req.readyState == 4) {
                        var code = req.status
                        if (code >= 200 && code < 400) {
                            var json = JSON.parse(req.response)
                            resolve(json)
                        } else {
                            reject(req)
                        }
                    }
                }
            } catch (err) {
                reject(err)
            }
        })
    }
}
