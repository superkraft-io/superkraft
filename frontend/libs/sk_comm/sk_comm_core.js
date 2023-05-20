class SK_Comm {
    constructor(){

    }

    call(target, action, data){
        return new Promise(async (resolve, reject) => {
            var doReject = res => {
                reject(res)
            }
            try {
                var res = await sk_communicator.send({cmd: `action_${target}`, vid: sk.id, action: action, data: data})
                if (res.rejected || res.status === false){
                    if (this.print) console.error(res)
                    return doReject(res)
                }
                
                if (this.print) console.log(res)

                resolve(res)
            } catch(err) {
                doReject(err)
            }
        })
    }

    main(action, data){
        return this.call('root', action, data)
    }

    view(action, data){
        return this.call(sk.id, action, data)
    }

    fetch(opt){
        return new Promise(async (resolve, reject)=>{
            //This function is taken from wavesurfer, with modifications

            class ProgressHandler {
                constructor(instance, contentLength, response){
                    this.instance = instance;
                    this.instance._reader = response.body.getReader();
                    this.total = parseInt(contentLength, 10);
                    this.loaded = 0;
                }

                start(controller){
                    var _this = this;

                    var read = function read() {
                        // instance._reader.read() returns a promise that resolves
                        // when a value has been received
                        _this.instance._reader.read().then(function (_ref) {
                        var done = _ref.done,
                            value = _ref.value;

                        // result objects contain two properties:
                        // done  - true if the stream has already given you all its data.
                        // value - some data. Always undefined when done is true.
                        if (done) {
                            // ensure onProgress called when content-length=0
                            if (_this.total === 0) {
                            _this.instance.onProgress.call(_this.instance, {
                                loaded: _this.loaded,
                                total: _this.total,
                                lengthComputable: false
                            });
                            } // no more data needs to be consumed, close the stream


                            controller.close();
                            return;
                        }

                        _this.loaded += value.byteLength;

                        _this.instance.onProgress.call(_this.instance, {
                            loaded: _this.loaded,
                            total: _this.total,
                            lengthComputable: !(_this.total === 0)
                        }); // enqueue the next data chunk into our target stream


                        controller.enqueue(value);
                        read();

                        }).catch(function (error) {
                            controller.error(error);
                        });
                    };

                    read();
                }
            }





            var instance = {}//new _observer.default();
            var fetchHeaders = new Headers();
            var fetchRequest = new Request(opt.url); // add ability to abort

            instance.controller = new AbortController(); // check if headers have to be added

            if (opt && opt.requestHeaders) {
                // add custom request headers
                opt.requestHeaders.forEach(function (header) {
                    fetchHeaders.append(header.key, header.value);
                });
            } // parse fetch opt


            var responseType = opt.responseType || 'json';
            var fetchopt = {
                method: opt.method || 'GET',
                headers: fetchHeaders,
                mode: opt.mode || 'cors',
                credentials: opt.credentials || 'same-origin',
                cache: opt.cache || 'default',
                redirect: opt.redirect || 'follow',
                referrer: opt.referrer || 'client',
                signal: instance.controller.signal
            };

            try {
                var doFetch = async ()=>{
                    return new Promise(async (resolve, reject)=>{
                        var _response = await fetch(fetchRequest, fetchopt).then(function (response) {
                            // store response reference
                            instance.response = response;
                            var progressAvailable = true;
        
                            if (!response.body) {
                                // ReadableStream is not yet supported in this browser
                                // see https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
                                progressAvailable = false;
                            } // Server must send CORS header "Access-Control-Expose-Headers: content-length"
        
        
                            var contentLength = response.headers.get('content-length');
        
                            if (contentLength === null) {
                                // Content-Length server response header missing.
                                // Don't evaluate download progress if we can't compare against a total size
                                // see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Access-Control-Expose-Headers
                                progressAvailable = false;
                            }
        
                            if (!progressAvailable) {
                                // not able to check download progress so skip it
                                return response;
                            } // fire progress event when during load
        
        
                            instance.onProgress = function (_e) {
                                if (opt.onProgress) opt.onProgress({..._e, ...{percent: (_e.loaded/_e.total)*100}})
                                if (_e.loaded === _e.total) resolve(_response)
                            };
        
                            return new Response(new ReadableStream(new ProgressHandler(instance, contentLength, response)), fetchopt);
                        })
                    })
                }
                
                var response = await doFetch()

                var errMsg;

                if (response.ok){
                    var val = undefined

                         if (responseType === 'arraybuffer') val = await response.arrayBuffer();
                    else if (responseType === 'json') val = await response.json();
                    else if (responseType === 'blob') val = await response.blob();
                    else if (responseType === 'text')  val = await response.text();
                    else errMsg = 'Unknown responseType: ' + responseType;

                    if (val === undefined){
                        errorMsg = 'Undefined response'
                        
                        if (!errMsg) {
                            errMsg = 'HTTP error status: ' + response.status;
                        }

                       return  reject(new Error(errMsg))
                    }
                }

                

                
                
                //if (opt.onDone) opt.onDone(response);
                resolve(val)
            } catch(error) {
                //if (opt.onerror) opt.onerror(error);
                reject(error)
            } // return the fetch request

            instance.fetchRequest = fetchRequest;
            return instance;
        })
    }
}