window.sk_juce_api = {}


function getDirname(asArray) {
    var stack = (new Error()).stack
    //stack = console.trace()
    var firstCaller = stack.split('\n').at(-1)
    var split1 = firstCaller.split('//juce.backend')
    var el1 = split1[1]
    var split2 = el1.split(':')
    var el2 = split2[0]
    var split3 = el2.split('/')
    var trimmedPath = split3
    trimmedPath.splice(trimmedPath.length - 1, 1)
    trimmedPath = trimmedPath.join('/')

    return trimmedPath
}

Object.defineProperty(window, '__dirname', {
    get(){         
        return getDirname()
    },
});


sk_juce_api.fetch = (path, data)=>{
    /*
    
        maybe need to format path to handle certain scenarios such as:

        ./targetFile.js
        ./ targetFile       without extension
        ../                 walk up the path - !!! IMPORTANT !!! walking up a path may not exceed the root of the "assets" folder
        \                   non-unix path delimiters
    
    */
    
    var finalPath = path
    if (data) path += '!' + btoa(JSON.stringify(data))
        console.log(path)
        
    const request = new XMLHttpRequest()
    try {
        request.open('GET', path, false)
        request.send()
    } catch (err) {
        console.error(err)
        throw 'Could not fetch module at ' + path
    }

    var response = undefined

    try { response = request.responseText } catch { response = request.response }

    if (request.getAllResponseHeaders().indexOf('application/json') > -1) response = JSON.parse(response)

    return response
}

window.sk_juce_api.nativeModules = {
    node: { os: '', fs: '', path: '', child_process: '' },
    npm: { electron: '' },
    sk: { application: '', web: '' }
}

for (var catName in window.sk_juce_api.nativeModules) {
    var category = window.sk_juce_api.nativeModules[catName]
    for (var modName in category) {
        window.sk_juce_api.nativeModules[catName][modName] =__dirname + '/' + catName + '/' + modName + '.js'
    }
}


sk_juce_api.machineInfo = sk_juce_api.fetch('sk/machine', {func: 'getStaticInfo'})
