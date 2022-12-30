module.exports = class SK_Stats {
    constructor(){
        this.stats = {
            get: {},
            post: {}
        }

        this.oldStats = JSON.stringify(this.stats)

        setInterval(()=>{
            this.print()
        }, 1000)
    }

    increment(opt){
        this.oldStats = JSON.stringify(this.stats)

        var type = this.stats[opt.type]

        var route = type[opt.route]
        if (!route) type[opt.route] = 0

        type[opt.route]++
    }

    print(){
        var newStats = JSON.stringify(this.stats)

        if (this.oldStats === newStats) return

        console.log(this.stats.get)
        console.log(this.stats.post)
    }
}