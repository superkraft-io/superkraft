class sk_ui_languageAndCurrencyDropdown extends sk_ui_dropdown {
    constructor(opt){
        super(opt)

        

        var searchItem = {onCustomize: _c => {
            _c.styling += ' fullwidth'
            _c.isSearchField = true
            _c.leftSide.remove()

            _c.content.setup(_c => {
                _c.styling += ' fullwidth'

                _c.add.icon(_c => {
                    _c.marginLeft = 6
                    _c.icon = 'search'
                })

                var searchInput = _c.add.input(_c => {
                    _c.styling += ' fill'
                    _c.marginRight = 6
                    _c.placeholder = sk.l10n.getPhrase('search') + '...'
                    _c.onChanged = val => {
                        this.filterBy(val)
                    }
                })

                _c.add.iconButton(_c => {
                    _c.roundness = 42
                    _c.icon = 'close'
                    _c.onClick = _e => {
                        _e.stopPropagation()
                        _e.preventDefault()
                        searchInput.value = ''
                    }
                })
            })

            _c.rightSide.remove()

            return 
        }}



        this.items = ()=>{
            var list = []

            if (this.type === 'currencies')  list = list.concat(list, sk_ui_languageAndCurrencyDropdown.currencyListItems)
            else if (this.type === 'countries') list = list.concat(list, sk_ui_languageAndCurrencyDropdown.countryListItems)
            
            list.unshift(searchItem)

            return list
        }

    }


    filterCurrencies(items, value){
        for (var i in items){
            var item = items[i]
            if (item.isSearchField) continue

            if (item.opt.currencyInfo.name.toLowerCase() === value || item.opt.currencyInfo.code.toLowerCase() === value || item.opt.currencyInfo.symbol_native.toLowerCase() === value){
                item.style.display = ''
                return
            }
        }

        for (var i in items){
            var item = items[i]
            if (item.isSearchField) continue


            if (item.opt.currencyInfo.name.toLowerCase().indexOf(value) > -1 || item.opt.currencyInfo.code.toLowerCase().indexOf(value) > -1){
                item.style.display = ''
            }
        }
    }

    filterCountries(items, value){
        for (var i in items){
            var item = items[i]
            if (item.isSearchField) continue


            if (item.opt.country_code.toLowerCase().indexOf(value) > -1 || item.opt.label.toLowerCase().indexOf(value) > -1){
                item.style.display = ''
            }
        }
    }

    filterBy(_value){
        var value = _value.trim().toLowerCase()
        var items = this.contextMenu.menu.sk_items

        
        for (var i in items){
            var item = items[i]
            if (item.isSearchField) continue
            item.style.display = (value !== '' ? 'none' : '')
        }

        if (value === '') return

        if (this.type === 'currencies') this.filterCurrencies(items, value)
        if (this.type === 'countries') this.filterCountries(items, value)
    }

    static get currencyListItems(){
        var list = []
        for (var currency in sk_ui_languageAndCurrencyDropdown.currencyCountryCodeList){
            var currencyInfo = sk_ui_languageAndCurrencyDropdown.currencyList[currency.toUpperCase()]
            try {
                var country_code = sk_ui_languageAndCurrencyDropdown.currencyCountryCodeList[currency]
                list.push({
                    icon: country_code + ' flag',
                    label: currencyInfo.code,
                    currencyInfo: currencyInfo,
                    currency: currency,
                    onCustomize: _item => {
                        _item.rightSide.add.label(_c => {
                            //_c.roundness = 6
                            //_c.style.padding = '4px 6px'
                            //_c.backgroundColor = 'var(--sk_ui_color_dark_grey)'
                            _c.opacity = 0.5
                            _c.text = _item.opt.currencyInfo.symbol_native
                        })

                        return true
                    },

                    onAfterCreated: _item => {
                        _item.content.label.style.fontFamily = 'monospace'

                        _item.content.add.label(_c => {
                            _c.text = _item.opt.currencyInfo.name
                        })
                    }
                })
            } catch(err) {
            }
        }
        
        return list
    }

    static get countryListItems(){
        var list = []
        for (var country_code in sk_ui_languageAndCurrencyDropdown.countryCodeCountryName){
           
            var country_name = sk_ui_languageAndCurrencyDropdown.countryCodeCountryName[country_code]
            list.push({
                icon: country_code + ' flag',
                label: country_name,
                country_code: country_code
            })
        }
        
        return list
    }

    static get currencyList(){
        return {
            "USD": {
                "symbol": "$",
                "name": "US Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "USD",
                "name_plural": "US dollars"
            },
            "CAD": {
                "symbol": "CA$",
                "name": "Canadian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "CAD",
                "name_plural": "Canadian dollars"
            },
            "EUR": {
                "symbol": "€",
                "name": "Euro",
                "symbol_native": "€",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "EUR",
                "name_plural": "euros"
            },
            "AED": {
                "symbol": "AED",
                "name": "United Arab Emirates Dirham",
                "symbol_native": "د.إ.‏",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "AED",
                "name_plural": "UAE dirhams"
            },
            "AFN": {
                "symbol": "Af",
                "name": "Afghan Afghani",
                "symbol_native": "؋",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "AFN",
                "name_plural": "Afghan Afghanis"
            },
            "ALL": {
                "symbol": "ALL",
                "name": "Albanian Lek",
                "symbol_native": "Lek",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "ALL",
                "name_plural": "Albanian lekë"
            },
            "AMD": {
                "symbol": "AMD",
                "name": "Armenian Dram",
                "symbol_native": "դր.",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "AMD",
                "name_plural": "Armenian drams"
            },
            "ARS": {
                "symbol": "AR$",
                "name": "Argentine Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "ARS",
                "name_plural": "Argentine pesos"
            },
            "AUD": {
                "symbol": "AU$",
                "name": "Australian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "AUD",
                "name_plural": "Australian dollars"
            },
            "AZN": {
                "symbol": "man.",
                "name": "Azerbaijani Manat",
                "symbol_native": "ман.",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "AZN",
                "name_plural": "Azerbaijani manats"
            },
            "BAM": {
                "symbol": "KM",
                "name": "Bosnia-Herzegovina Convertible Mark",
                "symbol_native": "KM",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "BAM",
                "name_plural": "Bosnia-Herzegovina convertible marks"
            },
            "BDT": {
                "symbol": "Tk",
                "name": "Bangladeshi Taka",
                "symbol_native": "৳",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "BDT",
                "name_plural": "Bangladeshi takas"
            },
            "BGN": {
                "symbol": "BGN",
                "name": "Bulgarian Lev",
                "symbol_native": "лв.",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "BGN",
                "name_plural": "Bulgarian leva"
            },
            "BHD": {
                "symbol": "BD",
                "name": "Bahraini Dinar",
                "symbol_native": "د.ب.‏",
                "decimal_digits": 3,
                "rounding": 0,
                "code": "BHD",
                "name_plural": "Bahraini dinars"
            },
            "BIF": {
                "symbol": "FBu",
                "name": "Burundian Franc",
                "symbol_native": "FBu",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "BIF",
                "name_plural": "Burundian francs"
            },
            "BND": {
                "symbol": "BN$",
                "name": "Brunei Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "BND",
                "name_plural": "Brunei dollars"
            },
            "BOB": {
                "symbol": "Bs",
                "name": "Bolivian Boliviano",
                "symbol_native": "Bs",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "BOB",
                "name_plural": "Bolivian bolivianos"
            },
            "BRL": {
                "symbol": "R$",
                "name": "Brazilian Real",
                "symbol_native": "R$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "BRL",
                "name_plural": "Brazilian reals"
            },
            "BWP": {
                "symbol": "BWP",
                "name": "Botswanan Pula",
                "symbol_native": "P",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "BWP",
                "name_plural": "Botswanan pulas"
            },
            "BYN": {
                "symbol": "Br",
                "name": "Belarusian Ruble",
                "symbol_native": "руб.",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "BYN",
                "name_plural": "Belarusian rubles"
            },
            "BZD": {
                "symbol": "BZ$",
                "name": "Belize Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "BZD",
                "name_plural": "Belize dollars"
            },
            "CDF": {
                "symbol": "CDF",
                "name": "Congolese Franc",
                "symbol_native": "FrCD",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "CDF",
                "name_plural": "Congolese francs"
            },
            "CHF": {
                "symbol": "CHF",
                "name": "Swiss Franc",
                "symbol_native": "CHF",
                "decimal_digits": 2,
                "rounding": 0.05,
                "code": "CHF",
                "name_plural": "Swiss francs"
            },
            "CLP": {
                "symbol": "CL$",
                "name": "Chilean Peso",
                "symbol_native": "$",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "CLP",
                "name_plural": "Chilean pesos"
            },
            "CNY": {
                "symbol": "CN¥",
                "name": "Chinese Yuan",
                "symbol_native": "CN¥",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "CNY",
                "name_plural": "Chinese yuan"
            },
            "COP": {
                "symbol": "CO$",
                "name": "Colombian Peso",
                "symbol_native": "$",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "COP",
                "name_plural": "Colombian pesos"
            },
            "CRC": {
                "symbol": "₡",
                "name": "Costa Rican Colón",
                "symbol_native": "₡",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "CRC",
                "name_plural": "Costa Rican colóns"
            },
            "CVE": {
                "symbol": "CV$",
                "name": "Cape Verdean Escudo",
                "symbol_native": "CV$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "CVE",
                "name_plural": "Cape Verdean escudos"
            },
            "CZK": {
                "symbol": "Kč",
                "name": "Czech Republic Koruna",
                "symbol_native": "Kč",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "CZK",
                "name_plural": "Czech Republic korunas"
            },
            "DJF": {
                "symbol": "Fdj",
                "name": "Djiboutian Franc",
                "symbol_native": "Fdj",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "DJF",
                "name_plural": "Djiboutian francs"
            },
            "DKK": {
                "symbol": "Dkr",
                "name": "Danish Krone",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "DKK",
                "name_plural": "Danish kroner"
            },
            "DOP": {
                "symbol": "RD$",
                "name": "Dominican Peso",
                "symbol_native": "RD$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "DOP",
                "name_plural": "Dominican pesos"
            },
            "DZD": {
                "symbol": "DA",
                "name": "Algerian Dinar",
                "symbol_native": "د.ج.‏",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "DZD",
                "name_plural": "Algerian dinars"
            },
            "EEK": {
                "symbol": "Ekr",
                "name": "Estonian Kroon",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "EEK",
                "name_plural": "Estonian kroons"
            },
            "EGP": {
                "symbol": "EGP",
                "name": "Egyptian Pound",
                "symbol_native": "ج.م.‏",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "EGP",
                "name_plural": "Egyptian pounds"
            },
            "ERN": {
                "symbol": "Nfk",
                "name": "Eritrean Nakfa",
                "symbol_native": "Nfk",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "ERN",
                "name_plural": "Eritrean nakfas"
            },
            "ETB": {
                "symbol": "Br",
                "name": "Ethiopian Birr",
                "symbol_native": "Br",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "ETB",
                "name_plural": "Ethiopian birrs"
            },
            "GBP": {
                "symbol": "£",
                "name": "British Pound Sterling",
                "symbol_native": "£",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "GBP",
                "name_plural": "British pounds sterling"
            },
            "GEL": {
                "symbol": "GEL",
                "name": "Georgian Lari",
                "symbol_native": "GEL",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "GEL",
                "name_plural": "Georgian laris"
            },
            "GHS": {
                "symbol": "GH₵",
                "name": "Ghanaian Cedi",
                "symbol_native": "GH₵",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "GHS",
                "name_plural": "Ghanaian cedis"
            },
            "GNF": {
                "symbol": "FG",
                "name": "Guinean Franc",
                "symbol_native": "FG",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "GNF",
                "name_plural": "Guinean francs"
            },
            "GTQ": {
                "symbol": "GTQ",
                "name": "Guatemalan Quetzal",
                "symbol_native": "Q",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "GTQ",
                "name_plural": "Guatemalan quetzals"
            },
            "HKD": {
                "symbol": "HK$",
                "name": "Hong Kong Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "HKD",
                "name_plural": "Hong Kong dollars"
            },
            "HNL": {
                "symbol": "HNL",
                "name": "Honduran Lempira",
                "symbol_native": "L",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "HNL",
                "name_plural": "Honduran lempiras"
            },
            "HRK": {
                "symbol": "kn",
                "name": "Croatian Kuna",
                "symbol_native": "kn",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "HRK",
                "name_plural": "Croatian kunas"
            },
            "HUF": {
                "symbol": "Ft",
                "name": "Hungarian Forint",
                "symbol_native": "Ft",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "HUF",
                "name_plural": "Hungarian forints"
            },
            "IDR": {
                "symbol": "Rp",
                "name": "Indonesian Rupiah",
                "symbol_native": "Rp",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "IDR",
                "name_plural": "Indonesian rupiahs"
            },
            "INR": {
                "symbol": "Rs",
                "name": "Indian Rupee",
                "symbol_native": "টকা",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "INR",
                "name_plural": "Indian rupees"
            },
            "IQD": {
                "symbol": "IQD",
                "name": "Iraqi Dinar",
                "symbol_native": "د.ع.‏",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "IQD",
                "name_plural": "Iraqi dinars"
            },
            "IRR": {
                "symbol": "IRR",
                "name": "Iranian Rial",
                "symbol_native": "﷼",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "IRR",
                "name_plural": "Iranian rials"
            },
            "ISK": {
                "symbol": "Ikr",
                "name": "Icelandic Króna",
                "symbol_native": "kr",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "ISK",
                "name_plural": "Icelandic krónur"
            },
            "JMD": {
                "symbol": "J$",
                "name": "Jamaican Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "JMD",
                "name_plural": "Jamaican dollars"
            },
            "JOD": {
                "symbol": "JD",
                "name": "Jordanian Dinar",
                "symbol_native": "د.أ.‏",
                "decimal_digits": 3,
                "rounding": 0,
                "code": "JOD",
                "name_plural": "Jordanian dinars"
            },
            "JPY": {
                "symbol": "¥",
                "name": "Japanese Yen",
                "symbol_native": "￥",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "JPY",
                "name_plural": "Japanese yen"
            },
            "KES": {
                "symbol": "Ksh",
                "name": "Kenyan Shilling",
                "symbol_native": "Ksh",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "KES",
                "name_plural": "Kenyan shillings"
            },
            "KHR": {
                "symbol": "KHR",
                "name": "Cambodian Riel",
                "symbol_native": "៛",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "KHR",
                "name_plural": "Cambodian riels"
            },
            "KMF": {
                "symbol": "CF",
                "name": "Comorian Franc",
                "symbol_native": "FC",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "KMF",
                "name_plural": "Comorian francs"
            },
            "KRW": {
                "symbol": "₩",
                "name": "South Korean Won",
                "symbol_native": "₩",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "KRW",
                "name_plural": "South Korean won"
            },
            "KWD": {
                "symbol": "KD",
                "name": "Kuwaiti Dinar",
                "symbol_native": "د.ك.‏",
                "decimal_digits": 3,
                "rounding": 0,
                "code": "KWD",
                "name_plural": "Kuwaiti dinars"
            },
            "KZT": {
                "symbol": "KZT",
                "name": "Kazakhstani Tenge",
                "symbol_native": "тңг.",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "KZT",
                "name_plural": "Kazakhstani tenges"
            },
            "LBP": {
                "symbol": "L.L.",
                "name": "Lebanese Pound",
                "symbol_native": "ل.ل.‏",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "LBP",
                "name_plural": "Lebanese pounds"
            },
            "LKR": {
                "symbol": "SLRs",
                "name": "Sri Lankan Rupee",
                "symbol_native": "SL Re",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "LKR",
                "name_plural": "Sri Lankan rupees"
            },
            "LTL": {
                "symbol": "Lt",
                "name": "Lithuanian Litas",
                "symbol_native": "Lt",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "LTL",
                "name_plural": "Lithuanian litai"
            },
            "LVL": {
                "symbol": "Ls",
                "name": "Latvian Lats",
                "symbol_native": "Ls",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "LVL",
                "name_plural": "Latvian lati"
            },
            "LYD": {
                "symbol": "LD",
                "name": "Libyan Dinar",
                "symbol_native": "د.ل.‏",
                "decimal_digits": 3,
                "rounding": 0,
                "code": "LYD",
                "name_plural": "Libyan dinars"
            },
            "MAD": {
                "symbol": "MAD",
                "name": "Moroccan Dirham",
                "symbol_native": "د.م.‏",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "MAD",
                "name_plural": "Moroccan dirhams"
            },
            "MDL": {
                "symbol": "MDL",
                "name": "Moldovan Leu",
                "symbol_native": "MDL",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "MDL",
                "name_plural": "Moldovan lei"
            },
            "MGA": {
                "symbol": "MGA",
                "name": "Malagasy Ariary",
                "symbol_native": "MGA",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "MGA",
                "name_plural": "Malagasy Ariaries"
            },
            "MKD": {
                "symbol": "MKD",
                "name": "Macedonian Denar",
                "symbol_native": "MKD",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "MKD",
                "name_plural": "Macedonian denari"
            },
            "MMK": {
                "symbol": "MMK",
                "name": "Myanma Kyat",
                "symbol_native": "K",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "MMK",
                "name_plural": "Myanma kyats"
            },
            "MOP": {
                "symbol": "MOP$",
                "name": "Macanese Pataca",
                "symbol_native": "MOP$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "MOP",
                "name_plural": "Macanese patacas"
            },
            "MUR": {
                "symbol": "MURs",
                "name": "Mauritian Rupee",
                "symbol_native": "MURs",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "MUR",
                "name_plural": "Mauritian rupees"
            },
            "MXN": {
                "symbol": "MX$",
                "name": "Mexican Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "MXN",
                "name_plural": "Mexican pesos"
            },
            "MYR": {
                "symbol": "RM",
                "name": "Malaysian Ringgit",
                "symbol_native": "RM",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "MYR",
                "name_plural": "Malaysian ringgits"
            },
            "MZN": {
                "symbol": "MTn",
                "name": "Mozambican Metical",
                "symbol_native": "MTn",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "MZN",
                "name_plural": "Mozambican meticals"
            },
            "NAD": {
                "symbol": "N$",
                "name": "Namibian Dollar",
                "symbol_native": "N$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "NAD",
                "name_plural": "Namibian dollars"
            },
            "NGN": {
                "symbol": "₦",
                "name": "Nigerian Naira",
                "symbol_native": "₦",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "NGN",
                "name_plural": "Nigerian nairas"
            },
            "NIO": {
                "symbol": "C$",
                "name": "Nicaraguan Córdoba",
                "symbol_native": "C$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "NIO",
                "name_plural": "Nicaraguan córdobas"
            },
            "NOK": {
                "symbol": "Nkr",
                "name": "Norwegian Krone",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "NOK",
                "name_plural": "Norwegian kroner"
            },
            "NPR": {
                "symbol": "NPRs",
                "name": "Nepalese Rupee",
                "symbol_native": "नेरू",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "NPR",
                "name_plural": "Nepalese rupees"
            },
            "NZD": {
                "symbol": "NZ$",
                "name": "New Zealand Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "NZD",
                "name_plural": "New Zealand dollars"
            },
            "OMR": {
                "symbol": "OMR",
                "name": "Omani Rial",
                "symbol_native": "ر.ع.‏",
                "decimal_digits": 3,
                "rounding": 0,
                "code": "OMR",
                "name_plural": "Omani rials"
            },
            "PAB": {
                "symbol": "B/.",
                "name": "Panamanian Balboa",
                "symbol_native": "B/.",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "PAB",
                "name_plural": "Panamanian balboas"
            },
            "PEN": {
                "symbol": "S/.",
                "name": "Peruvian Nuevo Sol",
                "symbol_native": "S/.",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "PEN",
                "name_plural": "Peruvian nuevos soles"
            },
            "PHP": {
                "symbol": "₱",
                "name": "Philippine Peso",
                "symbol_native": "₱",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "PHP",
                "name_plural": "Philippine pesos"
            },
            "PKR": {
                "symbol": "PKRs",
                "name": "Pakistani Rupee",
                "symbol_native": "₨",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "PKR",
                "name_plural": "Pakistani rupees"
            },
            "PLN": {
                "symbol": "zł",
                "name": "Polish Zloty",
                "symbol_native": "zł",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "PLN",
                "name_plural": "Polish zlotys"
            },
            "PYG": {
                "symbol": "₲",
                "name": "Paraguayan Guarani",
                "symbol_native": "₲",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "PYG",
                "name_plural": "Paraguayan guaranis"
            },
            "QAR": {
                "symbol": "QR",
                "name": "Qatari Rial",
                "symbol_native": "ر.ق.‏",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "QAR",
                "name_plural": "Qatari rials"
            },
            "RON": {
                "symbol": "RON",
                "name": "Romanian Leu",
                "symbol_native": "RON",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "RON",
                "name_plural": "Romanian lei"
            },
            "RSD": {
                "symbol": "din.",
                "name": "Serbian Dinar",
                "symbol_native": "дин.",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "RSD",
                "name_plural": "Serbian dinars"
            },
            "RUB": {
                "symbol": "RUB",
                "name": "Russian Ruble",
                "symbol_native": "₽.",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "RUB",
                "name_plural": "Russian rubles"
            },
            "RWF": {
                "symbol": "RWF",
                "name": "Rwandan Franc",
                "symbol_native": "FR",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "RWF",
                "name_plural": "Rwandan francs"
            },
            "SAR": {
                "symbol": "SR",
                "name": "Saudi Riyal",
                "symbol_native": "ر.س.‏",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "SAR",
                "name_plural": "Saudi riyals"
            },
            "SDG": {
                "symbol": "SDG",
                "name": "Sudanese Pound",
                "symbol_native": "SDG",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "SDG",
                "name_plural": "Sudanese pounds"
            },
            "SEK": {
                "symbol": "Skr",
                "name": "Swedish Krona",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "SEK",
                "name_plural": "Swedish kronor"
            },
            "SGD": {
                "symbol": "S$",
                "name": "Singapore Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "SGD",
                "name_plural": "Singapore dollars"
            },
            "SOS": {
                "symbol": "Ssh",
                "name": "Somali Shilling",
                "symbol_native": "Ssh",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "SOS",
                "name_plural": "Somali shillings"
            },
            "SYP": {
                "symbol": "SY£",
                "name": "Syrian Pound",
                "symbol_native": "ل.س.‏",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "SYP",
                "name_plural": "Syrian pounds"
            },
            "THB": {
                "symbol": "฿",
                "name": "Thai Baht",
                "symbol_native": "฿",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "THB",
                "name_plural": "Thai baht"
            },
            "TND": {
                "symbol": "DT",
                "name": "Tunisian Dinar",
                "symbol_native": "د.ت.‏",
                "decimal_digits": 3,
                "rounding": 0,
                "code": "TND",
                "name_plural": "Tunisian dinars"
            },
            "TOP": {
                "symbol": "T$",
                "name": "Tongan Paʻanga",
                "symbol_native": "T$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "TOP",
                "name_plural": "Tongan paʻanga"
            },
            "TRY": {
                "symbol": "TL",
                "name": "Turkish Lira",
                "symbol_native": "TL",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "TRY",
                "name_plural": "Turkish Lira"
            },
            "TTD": {
                "symbol": "TT$",
                "name": "Trinidad and Tobago Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "TTD",
                "name_plural": "Trinidad and Tobago dollars"
            },
            "TWD": {
                "symbol": "NT$",
                "name": "New Taiwan Dollar",
                "symbol_native": "NT$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "TWD",
                "name_plural": "New Taiwan dollars"
            },
            "TZS": {
                "symbol": "TSh",
                "name": "Tanzanian Shilling",
                "symbol_native": "TSh",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "TZS",
                "name_plural": "Tanzanian shillings"
            },
            "UAH": {
                "symbol": "₴",
                "name": "Ukrainian Hryvnia",
                "symbol_native": "₴",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "UAH",
                "name_plural": "Ukrainian hryvnias"
            },
            "UGX": {
                "symbol": "USh",
                "name": "Ugandan Shilling",
                "symbol_native": "USh",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "UGX",
                "name_plural": "Ugandan shillings"
            },
            "UYU": {
                "symbol": "$U",
                "name": "Uruguayan Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "UYU",
                "name_plural": "Uruguayan pesos"
            },
            "UZS": {
                "symbol": "UZS",
                "name": "Uzbekistan Som",
                "symbol_native": "UZS",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "UZS",
                "name_plural": "Uzbekistan som"
            },
            "VEF": {
                "symbol": "Bs.F.",
                "name": "Venezuelan Bolívar",
                "symbol_native": "Bs.F.",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "VEF",
                "name_plural": "Venezuelan bolívars"
            },
            "VND": {
                "symbol": "₫",
                "name": "Vietnamese Dong",
                "symbol_native": "₫",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "VND",
                "name_plural": "Vietnamese dong"
            },
            "XAF": {
                "symbol": "FCFA",
                "name": "CFA Franc BEAC",
                "symbol_native": "FCFA",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "XAF",
                "name_plural": "CFA francs BEAC"
            },
            "XOF": {
                "symbol": "CFA",
                "name": "CFA Franc BCEAO",
                "symbol_native": "CFA",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "XOF",
                "name_plural": "CFA francs BCEAO"
            },
            "YER": {
                "symbol": "YR",
                "name": "Yemeni Rial",
                "symbol_native": "ر.ي.‏",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "YER",
                "name_plural": "Yemeni rials"
            },
            "ZAR": {
                "symbol": "R",
                "name": "South African Rand",
                "symbol_native": "R",
                "decimal_digits": 2,
                "rounding": 0,
                "code": "ZAR",
                "name_plural": "South African rand"
            },
            "ZMK": {
                "symbol": "ZK",
                "name": "Zambian Kwacha",
                "symbol_native": "ZK",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "ZMK",
                "name_plural": "Zambian kwachas"
            },
            "ZWL": {
                "symbol": "ZWL$",
                "name": "Zimbabwean Dollar",
                "symbol_native": "ZWL$",
                "decimal_digits": 0,
                "rounding": 0,
                "code": "ZWL",
                "name_plural": "Zimbabwean Dollar"
            }
        }
    }

    static currencyCountryCodeList = {
        "afn":"af",
        "all":"al",
        "dzd":"dz",
        "aoa":"ao",
        "xcd":"lc",
        "ars":"ar",
        "amd":"am",
        "awg":"aw",
        "aud":"au",
        "eur":"eu",
        "azn":"az",
        "bsd":"bs",
        "bhd":"bh",
        "bdt":"bd",
        "bbd":"bb",
        "byn":"by",
        "bzd":"bz",
        "xof":"ci",
        "bmd":"bm",
        "btn":"bt",
        "bob":"bo",
        "bov":"bo",
        "bam":"ba",
        "bwp":"bw",
        "brl":"br",
        "cad":"ca",
        "cve":"cv",
        "kyd":"ky",
        "xaf":"cm",
        "clp":"cl",
        "cny":"cn",
        "cop":"co",
        "kmf":"km",
        "cdf":"cd",
        "cup":"cu",
        "cuc":"cu",
        "czk":"cz",
        "dkk":"dk",
        "djf":"dj",
        "dop":"do",
        "egp":"eg",
        "ern":"er",
        "etb":"et",
        "fjd":"fj",
        "fkp":"fk",
        "gmd":"gm",
        "gel":"ge",
        "ghs":"gh",
        "gip":"gi",
        "gtq":"gt",
        "gbp":"gb",
        "gyd":"gy",
        "hkd":"hk",
        "huf":"hu",
        "isk":"is",
        "inr":"in",
        "idr":"id",
        "irr":"ir",
        "iqd":"iq",
        "jmd":"jm",
        "jpy":"jp",
        "jod":"jo",
        "kzt":"kz",
        "kes":"ke",
        "kwd":"kw",
        "kgs":"kg",
        "lak":"la",
        "lbp":"lb",
        "lsl":"ls",
        "lrd":"lr",
        "lyd":"ly",
        "mop":"mo",
        "mkd":"mk",
        "mga":"mg",
        "mwk":"mw",
        "myr":"my",
        "mvr":"mv",
        "mxn":"mx",
        "mdl":"md",
        "mnt":"mn",
        "mad":"ma",
        "mzn":"mz",
        "nad":"na",
        "npr":"np",
        "ang":"nl",
        "nzd":"nz",
        "nio":"ni",
        "ngn":"ng",
        "nok":"no",
        "omr":"om",
        "pkr":"pk",
        "pab":"pa",
        "pgk":"pg",
        "pyg":"py",
        "pen":"pe",
        "php":"ph",
        "qar":"qa",
        "ron":"ro",
        "rub":"ru",
        "rwf":"rw",
        "svc":"sv",
        "wst":"ws",
        "sar":"sa",
        "rsd":"rs",
        "scr":"sc",
        "sdg":"sd",
        "sek":"se",
        "chf":"ch",
        "syp":"sy",
        "twd":"tw",
        "tzs":"tz",
        "thb":"th",
        "top":"to",
        "ttd":"tt",
        "tnd":"tn",
        "try":"tr",
        "tmt":"tm",
        "ugx":"ug",
        "uah":"ua",
        "aed":"ae",
        "usd":"us",
        "uyu":"uy",
        "uzs":"uz",
        "ves":"ve",
        "vnd":"vn",
        "yer":"ye",
        "zar":"za",
        "zmw":"zm",
        "zwl":"zw",
        "bgn":"bg",
        "bif":"bi",
        "bnd":"bn",
        "crc":"cr",
        "eek":"ee",
        "gnf":"gn",
        "hnl":"hn",
        "hrk":"hr",
        "khr":"kh",
        "krw":"kr",
        "lkr":"lk",
        "ltl":"lt",
        "lvl":"lv",
        "mmk":"mm",
        "mur":"mu",
        "pln":"pl",
        "sgd":"sg",
        "sos":"so",
        "vef":"ve",
        "zmk":"zm",
        "szl":"sz",
        "htg":"ht",
        "ils":"ps",
        "kpw":"kp",
        "mru":"mr",
        "stn":"st",
        "sll":"sl",
        "sbd":"sb",
        "ssp":"ss",
        "srd":"sr",
        "tjs":"tj",
        "vuv":"vu"
    }

    static countryCodeCurrencyList = {
        "xk":"eur",
        "al":"all",
        "af":"afn",
        "dz":"dzd",
        "ad":"eur",
        "ao":"aoa",
        "ag":"xcd",
        "ar":"ars",
        "am":"amd",
        "au":"aud",
        "at":"eur",
        "az":"azn",
        "bs":"bsd",
        "bh":"bhd",
        "bd":"bdt",
        "bb":"bbd",
        "by":"byn",
        "be":"eur",
        "bz":"bzd",
        "bj":"xof",
        "bt":"btn",
        "bo":"bob",
        "ba":"bam",
        "bw":"bwp",
        "br":"brl",
        "bn":"bnd",
        "bg":"bgn",
        "bf":"xof",
        "bi":"bif",
        "cv":"cve",
        "kh":"khr",
        "cm":"xaf",
        "ca":"cad",
        "cf":"xaf",
        "td":"xaf",
        "cl":"clp",
        "cn":"cny",
        "co":"cop",
        "km":"kmf",
        "cg":"xaf",
        "cd":"cdf",
        "cr":"crc",
        "hr":"hrk",
        "cu":"cup",
        "cy":"eur",
        "cz":"czk",
        "dk":"dkk",
        "dj":"djf",
        "dm":"xcd",
        "do":"dop",
        "ec":"usd",
        "eg":"egp",
        "sv":"usd",
        "gq":"xaf",
        "er":"ern",
        "ee":"eur",
        "sz":"szl",
        "et":"etb",
        "fj":"fjd",
        "fi":"eur",
        "fr":"eur",
        "ga":"xaf",
        "gm":"gmd",
        "ge":"gel",
        "de":"eur",
        "gh":"ghs",
        "gr":"eur",
        "gd":"xcd",
        "gt":"gtq",
        "gn":"gnf",
        "gw":"xof",
        "gy":"gyd",
        "ht":"htg",
        "hn":"hnl",
        "hu":"huf",
        "is":"isk",
        "in":"inr",
        "id":"idr",
        "ir":"irr",
        "iq":"iqd",
        "ie":"eur",
        "il":"ils",
        "it":"eur",
        "jm":"jmd",
        "jp":"jpy",
        "jo":"jod",
        "kz":"kzt",
        "ke":"kes",
        "ki":"aud",
        "kp":"kpw",
        "kr":"krw",
        "kw":"kwd",
        "kg":"kgs",
        "la":"lak",
        "lv":"eur",
        "lb":"lbp",
        "ls":"lsl",
        "lr":"lrd",
        "ly":"lyd",
        "li":"chf",
        "lt":"eur",
        "lu":"eur",
        "mg":"mga",
        "mw":"mwk",
        "my":"myr",
        "mv":"mvr",
        "ml":"xof",
        "mt":"eur",
        "mh":"usd",
        "mr":"mru",
        "mu":"mur",
        "mx":"mxn",
        "fm":"usd",
        "md":"mdl",
        "mc":"eur",
        "mn":"mnt",
        "me":"eur",
        "ma":"mad",
        "mz":"mzn",
        "mm":"mmk",
        "na":"nad",
        "nr":"aud",
        "np":"npr",
        "nl":"eur",
        "nz":"nzd",
        "ni":"nio",
        "ne":"xof",
        "ng":"ngn",
        "no":"nok",
        "om":"omr",
        "pk":"pkr",
        "pw":"usd",
        "pa":"pab",
        "pg":"pgk",
        "py":"pyg",
        "pe":"pen",
        "ph":"php",
        "pl":"pln",
        "pt":"eur",
        "qa":"qar",
        "ro":"ron",
        "ru":"rub",
        "rw":"rwf",
        "kn":"xcd",
        "lc":"xcd",
        "vc":"xcd",
        "ws":"wst",
        "sm":"eur",
        "st":"stn",
        "sa":"sar",
        "sn":"xof",
        "rs":"rsd",
        "sc":"scr",
        "sl":"sll",
        "sg":"sgd",
        "sk":"eur",
        "si":"eur",
        "sb":"sbd",
        "so":"sos",
        "za":"zar",
        "ss":"ssp",
        "es":"eur",
        "lk":"lkr",
        "sd":"sdg",
        "sr":"srd",
        "se":"sek",
        "ch":"chf",
        "sy":"syp",
        "tj":"tjs",
        "tz":"tzs",
        "th":"thb",
        "tl":"usd",
        "tg":"xof",
        "to":"top",
        "tt":"ttd",
        "tn":"tnd",
        "tr":"try",
        "tm":"tmt",
        "tv":"aud",
        "ug":"ugx",
        "ua":"uah",
        "ae":"aed",
        "gb":"gbp",
        "us":"usd",
        "uy":"uyu",
        "uz":"uzs",
        "vu":"vuv",
        "ve":"ves",
        "vn":"vnd",
        "ye":"yer",
        "zm":"zmw",
        "zw":"zwl",
        "va":"eur",
        "ps":"ils",
        "tw":"twd",
        "eh":"mad",
        "aw":"awg",
        "eu":"eur",
        "ci":"xof",
        "bm":"bmd",
        "ky":"kyd",
        "fk":"fkp",
        "gi":"gip",
        "hk":"hkd",
        "mo":"mop",
        "mk":"mkd"
    }

    static countryCodeCountryName = {
        "xk":"Kosova",
        "al":"Shqipëria",
        "af":"افغانستان",
        "dz":"الجزائر",
        "ad":"Andorra",
        "ao":"Angola",
        "ag":"Antigua and Barbuda",
        "ar":"Argentina",
        "am":"Հայաստան",
        "au":"Australia",
        "at":"Österreich",
        "az":"Azərbaycan",
        "bs":"Bahamas",
        "bh":"البحرين",
        "bd":"বাংলাদেশ",
        "bb":"Barbados",
        "by":"Беларусь",
        "be":"België",
        "bz":"Belize",
        "bj":"Bénin",
        "bt":"འབྲུག",
        "bo":"Bolivia",
        "ba":"Bosna i Hercegovina",
        "bw":"Botswana",
        "br":"Brasil",
        "bn":"Brunei",
        "bg":"България",
        "bf":"Burkina Faso",
        "bi":"Burundi",
        "cv":"Cabo Verde",
        "kh":"កម្ពុជា",
        "cm":"Cameroun",
        "ca":"Canada",
        "cf":"République centrafricaine",
        "td":"Tchad",
        "cl":"Chile",
        "cn":"中国",
        "co":"Colombia",
        "km":"جزر القمر",
        "cg":"Congo",
        "cd":"Congo (DRC)",
        "cr":"Costa Rica",
        "hr":"Hrvatska",
        "cu":"Cuba",
        "cy":"Κύπρος",
        "cz":"Česko",
        "dk":"Danmark",
        "dj":"Djibouti",
        "dm":"Dominica",
        "do":"República Dominicana",
        "ec":"Ecuador",
        "eg":"مصر‎",
        "sv":"El Salvador",
        "gq":"Guinea Ecuatorial",
        "er":"ኤርትራ",
        "ee":"Eesti",
        "sz":"Eswatini",
        "et":"ኢትዮጵያ",
        "fj":"Fiji",
        "fi":"Suomi",
        "fr":"France",
        "ga":"Gabon",
        "gm":"The Gambia",
        "ge":"საქართველო",
        "de":"Deutschland",
        "gh":"Ghana",
        "gr":"Ελλάδα",
        "gd":"Grenada",
        "gt":"Guatemala",
        "gn":"Guinée",
        "gw":"Guiné-Bissau",
        "gy":"Guyana",
        "ht":"Haïti",
        "hn":"Honduras",
        "hu":"Magyarország",
        "is":"Ísland",
        "in":"भारत",
        "id":"Indonesia",
        "ir":"ایران‎",
        "iq":"العراق‎",
        "ie":"Éire",
        "il":"ישראל‎",
        "it":"Italia",
        "jm":"Jamaica",
        "jp":"日本",
        "jo":"الأردن‎",
        "kz":"Қазақстан",
        "ke":"Kenya",
        "ki":"Kiribati",
        "kp":"조선",
        "kr":"대한민국",
        "kw":"الكويت",
        "kg":"Кыргызстан",
        "la":"ລາວ",
        "lv":"Latvija",
        "lb":"لبنان‎",
        "ls":"Lesotho",
        "lr":"Liberia",
        "ly":"ليبيا‎",
        "li":"Liechtenstein",
        "lt":"Lietuva",
        "lu":"Luxembourg",
        "mg":"Madagasikara",
        "mw":"Malawi",
        "my":"Malaysia",
        "mv":"ދިވެހިރާއްޖެ",
        "ml":"Mali",
        "mt":"Malta",
        "mh":"Marshall Islands",
        "mr":"موريتانيا‎",
        "mu":"Maurice",
        "mx":"México",
        "fm":"Micronesia",
        "md":"Moldova",
        "mc":"Monaco",
        "mn":"Монгол Улс",
        "me":"Црна Гора",
        "ma":"المغرب‎",
        "mz":"Moçambique",
        "mm":"မြန်မာ",
        "na":"Namibia",
        "nr":"Nauru",
        "np":"नेपाल",
        "nl":"Nederland",
        "nz":"New Zealand",
        "ni":"Nicaragua",
        "ne":"Niger",
        "ng":"Nigeria",
        "no":"Norge",
        "om":"عُمان‎",
        "pk":"پاکستان",
        "pw":"Palau",
        "pa":"Panamá",
        "pg":"Papua Niugini",
        "py":"Paraguay",
        "pe":"Perú",
        "ph":"Pilipinas",
        "pl":"Polska",
        "pt":"Portugal",
        "qa":"قطر‎",
        "ro":"România",
        "ru":"Россия",
        "rw":"Rwanda",
        "kn":"Saint Kitts and Nevis",
        "lc":"Saint Lucia",
        "vc":"Saint Vincent and the Grenadines",
        "ws":"Samoa",
        "sm":"San Marino",
        "st":"São Tomé e Príncipe",
        "sa":"المملكة العربية السعودية‎",
        "sn":"Sénégal",
        "rs":"Србија",
        "sc":"Seychelles",
        "sl":"Sierra Leone",
        "sg":"Singapore",
        "sk":"Slovensko",
        "si":"Slovenija",
        "sb":"Solomon Islands",
        "so":"Soomaaliya",
        "za":"South Africa",
        "ss":"South Sudan",
        "es":"España",
        "lk":"ශ්‍රී ලංකාව",
        "sd":"السودان‎",
        "sr":"Suriname",
        "se":"Sverige",
        "ch":"Schweiz",
        "sy":"سوريا‎",
        "tj":"Тоҷикистон",
        "tz":"Tanzania",
        "th":"ประเทศไทย",
        "tl":"Timor-Leste",
        "tg":"Togo",
        "to":"Tonga",
        "tt":"Trinidad and Tobago",
        "tn":"تونس‎",
        "tr":"Türkiye",
        "tm":"Türkmenistan",
        "tv":"Tuvalu",
        "ug":"Uganda",
        "ua":"Україна",
        "ae":"الإمارات العربية المتحدة‎",
        "gb":"United Kingdom",
        "us":"United States",
        "uy":"Uruguay",
        "uz":"Oʻzbekiston",
        "vu":"Vanuatu",
        "ve":"Venezuela",
        "vn":"Việt Nam",
        "ye":"اليمن‎",
        "zm":"Zambia",
        "zw":"Zimbabwe",
        "va":"Città del Vaticano",
        "ps":"دولة فلسطين‎",
        "tw":"臺灣",
        "eh":"الصحراء الغربية",
        "aw":"Aruba",
        "eu":"EU",
        "ci":"Côte d'Ivoire",
        "bm":"Bermuda",
        "ky":"Cayman Islands",
        "fk":"Islas Malvinas",
        "gi":"Gibraltar",
        "hk":"香港",
        "mo":"澳門",
        "mk":"Северна Македонија"
    }

    static countryCodeCurrency
}