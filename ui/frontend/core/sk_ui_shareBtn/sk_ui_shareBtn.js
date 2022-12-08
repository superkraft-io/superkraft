class sk_ui_shareBtn extends sk_ui_iconButton {
    constructor(opt){
        super(opt)
        
        this.icon = 'share alternate'
        this.width = 38
        this.hint({text: sk.l10n.getPhrase('share'), position: 'left center'})

        this.roundness = 8

        this.onClick = (sender, _e) => {
            sk.app.add.fromNew(sk_ui_shareBtn_modal, _c => {
                _c.show()
            })
        }
    }

    config(opt){

    }
}

class sk_ui_shareBtn_modal extends sk_ui_modal {
    constructor(opt){
        super(opt)
       
        this.closers = []

        this.content.setup(_c => {
            _c.add.label(_c => {
                _c.l10n = 'shareMsg'
            })

            _c.add.linkButton(_c => {
                _c.icon = 'twitter blue'
                _c.text = 'Share on Twitter'

                var text = 'Hi friends!<br><br>Check out https://splitter.ai that uses AI for different audio related stuff. I love it!<br><br>'.split(' ').join('%20').split('<br>').join('%0D%0A')
                _c.url = `https://twitter.com/intent/tweet?text=${text}&via=splitter_ai&hashtags=ai,ml,audio,karaoke,music`
                _c.target = '_blank'
                _c.element.setAttribute('data-size', 'large')
                
            })

            _c.add.linkButton(_c => {
                _c.icon = 'facebook blue'
                _c.text = 'Share on Facebook'

                var text = 'Hi friends!<br><br>Check out https://splitter.ai that uses AI for different audio related stuff. I love it!<br><br>'.split(' ').join('%20').split('<br>').join('%0D%0A')
                _c.url = `https://twitter.com/intent/tweet?text=${text}&via=splitter_ai&hashtags=ai,ml,audio,karaoke,music`
                _c.target = '_blank'
                _c.element.setAttribute('data-size', 'large')
                
            })
        })
    }
}