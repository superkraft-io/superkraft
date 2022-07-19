module.exports = class SK_POST {
    constructor(){
        this.info = {
            route: 'test',
            protected: false,
        }
    }

    async exec(req, res){
        try {
            //do something here

            res({status: true})
        } catch(err) {
            res({status: false})
        }
    }
}