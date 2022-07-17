class sk_ui_l10n_selector extends sk_ui_button {
    constructor(parent){
        super(parent)
        this.multiComponent = true
        
        this._icon.ignoreIconDefinition = true
        this.icon = 'us flag'
        this.text = 'English'

        this.roundness = 8

        


        this.countries = {
            en: {flag: 'us', name: 'English'},
            sq: {flag: 'al', name: 'Shqip'},
            no: {flag: 'no', name: 'Norsk'},
            sv: {flag: 'se', name: 'Svenska'},
            ro: {flag: 'ro', name: 'Română'},
            zh: {flag: 'cn', name: '中文'},
            ru: {flag: 'ru', name: 'русский'},
            ar: {flag: 'sa', name: 'عربى', direction: 'rtl'},
            pt: {flag: 'pt', name: 'Português'},

            es: {flag: 'es', name: 'Español'},
            ko: {flag: 'kr', name: '한국어'},
            it: {flag: 'it', name: 'Italiano'},
            de: {flag: 'de', name: 'Deutsche'},
            fr: {flag: 'fr', name: 'Français'},
            nl: {flag: 'nl', name: 'Nederlands'},
            fi: {flag: 'fi', name: 'Finland'},
            sk: {flag: 'sk', name: 'Slovenský'},
            sl: {flag: 'si', name: 'Slovenščina'},
            mt: {flag: 'mt', name: 'Malti'},
            hu: {flag: 'hu', name: 'Magyar'},
            lv: {flag: 'lv', name: 'Latvietis'},
            hr: {flag: 'hr', name: 'Hrvatski'},
            el: {flag: 'gr', name: 'Ελληνικά'},
            et: {flag: 'ee', name: 'Eestlane'},
            da: {flag: 'dk', name: 'Dansk'},
            cs: {flag: 'cz', name: 'Čechc'},
            bg: {flag: 'bg', name: 'български'},
            ga: {flag: 'ie', name: 'Gaeilge'}
        }

        var currentlySetCountry = Cookies.get('country')
        if (currentlySetCountry){
            var currSelCountry = this.countries[currentlySetCountry]
            this.icon = currSelCountry.flag + ' flag'
            this.text = currSelCountry.name
        }

        this.countryItemsList = []
        for (var i in sk.l10n.countries){
            var countryCode = sk.l10n.countries[i]
            this.countryItemsList.push({
                       
                label: this.countries[countryCode].name,
                countryCode: countryCode,
                icon: this.countries[countryCode].flag + ' flag',
                onClick: res =>{
                    Cookies.set('country', res.countryCode)
                    window.location.reload()
                }
            })
        }

        this.element.addEventListener('click', _e => {
            var rect = this.rect
            sk._cM.show({
                pos: {x: rect.x, y: rect.y},
                direction: 'up',
                origin: 'bottom',
                sender: this.element,
                toggle: true,
                items: this.countryItemsList,

                onItemCreated: item => {
                    item.icn.classList.remove('icon')
                    item.icon.style.marginRight = '8px'
                }
            })
        })
    }
}