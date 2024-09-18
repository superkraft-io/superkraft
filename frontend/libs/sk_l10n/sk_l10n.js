sk.l10n.getPhrase = (phraseID, fallbackPhrase = '<l10n_error>') => {
    var phrase = fallbackPhrase
    try { phrase = sk.l10n.phrases[phraseID] || fallbackPhrase } catch(err) { phrase = fallbackPhrase }

    try {var asJSON = JSON.parse(phrase); phrase = asJSON } catch(err) {
        var x = 0
    }

    return phrase
}