var whichModule = undefined

if (global.window._sk_app_type === 'wapp' || global.window._sk_app_type === 'dapp'){
    whichModule = require(__dirname + '/sk_fs_simple.js')
} else {
    if (global.window._sk_app_type === 'japp') whichModule = require(__dirname + '/sk_fs_juce.js')
    else if (global.window._sk_app_type === 'sapp') whichModule = require(__dirname + '/sk_fs_ssc.js')
}

module.exports = whichModule