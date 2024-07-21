window.sk_juce_api = {}


function getDirname(asArray) {
    var stack = (new Error()).stack
    //stack = console.trace()
    var firstCaller = stack.split('\n').at(-1)
    var trimmedPath = firstCaller.split('https://juce.backend')[1].split(':')[0].split('/')
    trimmedPath.splice(trimmedPath.length - 1, 1)
    trimmedPath = trimmedPath.join('/')

    return trimmedPath
}

Object.defineProperty(window, '__dirname', {
    get(){         
        return getDirname()
    },
});


sk_juce_api.fetch = path => {
    /*
    
        maybe need to format path to handle certain scenarios such as:

        ./targetFile.js
        ./ targetFile       without extension
        ../                 walk up the path - !!! IMPORTANT !!! walking up a path may not exceed the root of the "assets" folder
        \                   non-unix path delimiters
    
    */
    const request = new XMLHttpRequest()
    request.open('GET', path, false)
    try { request.send() } catch (err) {
        console.error(err)
        throw 'Could not fetch module at ' + path
    }

    var response = undefined

    try { response = request.responseText } catch { response = request.response }

    if (request.getAllResponseHeaders().indexOf('application/json') > -1) response = JSON.parse(response)

    return response
}

window.sk_juce_api.nativeModules = {
    node: { os:'', fs:'', path:'' },
    sk: { application:'' }
}

for (var catName in window.sk_juce_api.nativeModules) {
    var category = window.sk_juce_api.nativeModules[catName]
    for (var modName in category) {
        window.sk_juce_api.nativeModules[catName][modName] =__dirname + '/' + catName + '/' + modName + '.js'
    }
}


sk_juce_api.machineInfo = sk_juce_api.fetch('sk.getMachineStaticInfo')
//sk_juce_api.appInfo = sk_juce_api.fetch('sk.getAppStaticInfo')
