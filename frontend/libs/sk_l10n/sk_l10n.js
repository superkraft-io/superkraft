sk.l10n.getPhrase = (phraseID, fallbackPhrase = '<l10n_error>') => {
    var phrase = fallbackPhrase
    try { phrase = sk.l10n.phrases[phraseID] || fallbackPhrase } catch(err) { phrase = fallbackPhrase }
    return phrase
}
