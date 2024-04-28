var whichModule = undefined
if (!global.window._sk_app_type_is_ssc) whichModule = require(__dirname + '/sk_fs_simple.js')
else whichModule = require(__dirname + '/sk_fs_ssc.js')

module.exports = whichModule