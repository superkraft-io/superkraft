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


    window.global = window

    global.sai = {}

    var opt = {
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



    try {
        window.appMain = require('/main.js')
    } catch (err) {
        if (err.indexOf && err.indexOf('Could not fetch module') > -1) {
            console.warn('Could not load the project main.js file. Create a file named main.js inside the assets folder.')
        } else {
            console.error(err)
        }
    }


    var __superkraft = require('/superkraft/sk_superkraft.js')
    var sk = new __superkraft(opt)
}

start_app()