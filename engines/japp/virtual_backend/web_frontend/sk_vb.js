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
    await import('/superkraft/engines/japp/virtual_backend/web_frontend/sk_juce_api/core.js')
    await import('/superkraft/engines/japp/virtual_backend/web_frontend/sk_juce_api/module.js')
    await import('/superkraft/engines/japp/virtual_backend/web_frontend/sk_juce_api/node/path.js')

    //await sleep(5000)
    //var ssc = import('/virtual_backend/api/module.js')

    window.application = require('application')

    window.global = window

    global.sai = {}

    var opt = {
        sk_id: 'juce_sk',
        type: 'japp',
        root: '',

        projectRoot: '/sk_project',
        postsRoot: '/sk_posts/',
        templates: '/sk_templates/',
        globalActions: '/sk_globalActions/',
        globalFrontend: '/sk_globalFrontend/',

        nativeActions: __dirname + '/sk_nativeActions/',


        database: {},
        auth: {},

        l10n: {
            listCountries: () => { return [] },
            getForCountry: country => {
                return {}
            }
        },

        onAppReady: async () => {

        },

        onPreStart: () => {

        },

        onReady: async () => {
                
        }
    }

    var __superkraft = require('/superkraft/sk_superkraft.js')
    var sk = new __superkraft(opt)


    //sk_juce_api.sk_ipc.send('sk_juce_be', 'sk.ipc', {test: 'data', num: 12345})
}

start_app()