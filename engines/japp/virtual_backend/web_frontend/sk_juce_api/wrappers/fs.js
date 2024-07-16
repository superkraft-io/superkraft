window.sk_c_api = {}


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