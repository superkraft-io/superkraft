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

    //useComplexity: true
})