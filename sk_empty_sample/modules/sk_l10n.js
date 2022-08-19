module.exports = class SK_L10N {
    constructor(){
        this.categorized = {}
    }

    update(phraseList){
        this.categorized = {}

        var categorizePhrase = phrase => {
            for (var _col in phrase){
                var value = phrase[_col]
                
                if (_col === 'id' || _col === 'uuid') continue

                if (!this.categorized[_col]) this.categorized[_col] = {}

                this.categorized[_col][phrase.uuid] = (value !== null ? value : phrase.en)
            }
        }
    
        for (var i in phraseList){
            var phrase = phraseList[i]
            categorizePhrase(phrase)
        }
    }

    getForCountry(country){
        if (!this.categorized) return {}
        return (!this.categorized[country] ? this.categorized.en : this.categorized[country])
    }

    listCountries(){
        return Object.keys(this.categorized)
    }
}