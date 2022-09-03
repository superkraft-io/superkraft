class sk_ui_statusIndicator extends sk_ui_component {
    sk_constructor(opt){
        super.sk_constructor(opt)

        this.classAdd('sk_ui_statusIndicator_right')
        this.compact = true

        this.sk_attributes.add({friendlyName: 'Status', name: 'status', type: 'text', onSet: async val => {
            if (this.indicator){
                await this.hide({animation: 'width'})
                this.indicator.remove()
            }

            if (val === 'loader') this.configAs_loader()
            else this.configAs_other(val)

            /*this.animate = false
            this.width = 0.01
            this.animate = true
            */

            this.indicator.animate = false
            this.size = this.size || 16
            this.indicator.animate = true


            //this.width = this.size
            this.show({animation: 'width'})
            
        }})

        this.sk_attributes.add({friendlyName: 'Size', name: 'size', type: 'number', onSet: val => {
            this.indicator.size = val
        }})

        this.sk_attributes.add({friendlyName: 'Autohide', name: 'autohide', type: 'number', onSet: val => {
            if (!val) return clearTimeout(this.autohideTimer)

            if (val === true) val = 3000

            this.autohideTimer = setTimeout(()=>{
                this.destroy()
            }, val)
        }})

        this.sk_attributes.add({friendlyName: 'Side', name: 'side', type: 'text', onSet: val => {
            this.classRemove('sk_ui_statusIndicator_left sk_ui_statusIndicator_right')
            this.classAdd('sk_ui_statusIndicator_' + val)
            
            if (val === 'left') return this.moveBefore(this.parent.children.children[0])
            else if (val === 'right')  this.moveBefore(this.parent.children.children[this.parent.children.children - 1])
        }})
    }

    destroy(){
        return new Promise(async resolve => {
            this.indicator = undefined
            await this.remove({animation: 'width'})
            resolve()
        })
    }

    configAs_loader(){
        this.indicator = this.add.loader(_c => {})
    }

    configAs_other(status){
        var statuses = {
            ok      : 'green check circle outline',
            fail    : 'times circle outline red',
            warning : 'exclamation triangle icon yellow',
            external : 'external alternate',
        }

        this.indicator = this.add.icon(_c => {
            _c.size = this.size
            _c.icon = statuses[status] || status
        })
    }
}