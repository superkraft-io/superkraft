class sk_ui_l10n_selector extends sk_ui_button {
    constructor(opt){
        super(opt)
        this.multiComponent = true
        
        this._icon.ignoreIconDefinition = true
        this.icon = 'us flag'
        this.text = 'English'

        this.roundness = 8

        this.onClick = (_e, sender)=>{
            _e.stopPropagation()
            _e.preventDefault()
            return false
        }


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

        this.contextMenu.items = ()=>{
            var countryItemsList = []
            for (var i in sk.l10n.countries){
                var countryCode = sk.l10n.countries[i]
                countryItemsList.push({
                        
                    label: this.countries[countryCode].name,
                    countryCode: countryCode,
                    icon: this.countries[countryCode].flag + ' flag',
                    onClick: (res, noReload, noSelectFire)=>{
                        this.selectedItem = res
                        if (!this.ignoreCookie) Cookies.set('country', res.countryCode)
                        this.icon = this.countries[res.countryCode].flag + ' flag'
                        this.text = this.countries[res.countryCode].name
                        if (!noReload && !this.noReload) window.location.reload()
                        if (!noSelectFire && this.onLanguageSelected) this.onLanguageSelected(res, noReload, noSelectFire)
                    }
                })
            }

            if (this.beforeShow) this.beforeShow(countryItemsList)

            return countryItemsList
        }

        this.contextMenu.setup(_c => {
            _c.button = 'left'
            _c.direction = 'up'
            _c.togglable = true

            _c.position = opt => {
                return {x: this.rect.left, y: this.rect.y - opt.menuRect.height}
            }
        })
        
        this.contextMenu.onItemCreated = item => {
            if (item.opt.icon && !item.opt.icon.split(' ').includes('icon')) item.leftSide.icon.iconElement.classList.remove('icon')
            item.leftSide.marginLeft = 6
            item.leftSide.marginRight = 8
            
            if (this.onFormatItem) this.onFormatItem(item)
                
        }
    }

    findLanguageItem(countryCode){
        var items = this.contextMenu.items()

        for (var i in items){
            var item = items[i]
            if (item.countryCode === countryCode) return item
        }
    }

    selectLanguage(countryCode, noReload, noSelectFire){
        var item = this.findLanguageItem(countryCode)
        item.onClick(item, noReload, noSelectFire)
    }
}