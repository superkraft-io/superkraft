window.global = window
window.sk_appType = 'japp'

window.onBreak = () => {
    var x = 0
}

function sleep(delay = 1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, delay)
    })
}



var start_app = async () => {
    await import('/superkraft/engines/japp/virtual_backend/sk_juce_api/core.js')
    await import('/superkraft/engines/japp/virtual_backend/sk_juce_api/module.js')

    //var ssc = import('/virtual_backend/api/module.js')

    window.global = window

    global.sai = {}







    var opt = {
        sk_id: 'juce_sk',
        type: 'japp',
        root: '',

        projectRoot: '/sk_website',
        postsRoot: '/sk_posts/',
        templates: '/sk_templates/',
        globalActions: '/sk_globalActions/',
        globalFrontend: '/sk_globalFrontend/',


        database: {},
        auth: {},

        l10n: { },

        onAppReady: async () => {

        },

        onPreStart: () => {

        },

        onReady: async () => {
                
        }
    }

    var __superkraft = require('/superkraft/sk_superkraft.js')
    var sk = new __superkraft(opt)


    sk_c_api.sk_ipc.send('sk_c_be', 'sk.ipc', {test: 'data', num: 12345})
}

start_app()