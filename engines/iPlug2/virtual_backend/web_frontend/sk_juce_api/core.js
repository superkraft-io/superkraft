window.sk_juce_api = {
    staticInfo: {}
}


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


sk_juce_api.fetch = (path, data, onPreParse)=>{
    /*
    
        maybe need to format path to handle certain scenarios such as:

        ./targetFile.js
        ./ targetFile       without extension
        ../                 walk up the path - !!! IMPORTANT !!! walking up a path may not exceed the root of the "assets" folder
        \                   non-unix path delimiters
    
    */
    
    var finalPath = path
    if (data) path += '!' + btoa(JSON.stringify(data))
        
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

    if (request.getAllResponseHeaders().indexOf('application/json') > -1) {
        if (!onPreParse) response = JSON.parse(response)
        else response = onPreParse(response)
    }

    return response
}

window.sk_juce_api.nativeModules = {
    node: { fs: __dirname + '/modules/node/fs.js' }
}



sk_juce_api.initModules = (rootDir) => {
    var fs = require('fs')
    var categories = fs.readdirSync(rootDir + '/modules/')

    for (var i in categories) {
        var catName = categories[i]

        if (!sk_juce_api.nativeModules[catName]) sk_juce_api.nativeModules[catName] = {}

        var moduleCategory = fs.readdirSync(rootDir + '/modules/' + catName + '/')
        for (var u in moduleCategory) {
            var modName = moduleCategory[u].split('.')[0]
            sk_juce_api.nativeModules[catName][modName] = rootDir + '/modules/' + catName + '/' + modName + '.js'
        }
    }
}

sk_juce_api.staticInfo.machine = sk_juce_api.fetch('sk/machine', { func: 'getStaticInfo' })
sk_juce_api.staticInfo.application = sk_juce_api.fetch('sk/application', { func: 'getStaticInfo' })
