var sk = new (require('./superkraft/sk_superkraft.js'))({
    type: 'web',
    root: __dirname,
    projectRoot: __dirname + '/sk_projectRoot',
    postsRoot: __dirname + '/sk_posts/',
    templates: __dirname + '/sk_templates/',

    config: './config.json',

    database : new (require('./modules/sk_db.js'))(),
    auth     : new (require('./modules/sk_auth.js'))(),
    l10n     : new (require('./modules/sk_l10n.js'))(),

    //useComplexity: true,

    icons: {
        app: __dirname + '/app_assets/app_logo.png',
        view: __dirname + '/app_assets/default_view_icon.png',
    }
})