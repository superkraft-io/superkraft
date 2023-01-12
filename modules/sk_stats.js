module.exports = class SK_Stats {
    constructor(){
        this.stats = {}

        this.oldStats = JSON.stringify(this.stats)

        setInterval(()=>{
            this.print()
            this.reset()
        }, 5000)
    }

    increment(opt){
        return {
            end: ()=>{
                //do nothing
            }
        }

        return

        //this.oldStats = JSON.stringify(this.stats)

        var type = this.stats[opt.type]
        if (!type) this.stats[opt.type] = {}
        type = this.stats[opt.type]

        var route = type[opt.route]
        if (!route){
            type[opt.route] = {
                total: 0,

                perSec: {
                    count: 0,
                    secVal: 0
                },
                
                stopwatch: {
                    id: 0,
                    list: {}
                }
            }
        }

        route = type[opt.route]
        route.total++
        route.perSec.count++

        var sw = route.stopwatch
        sw.id++

        sw.list[sw.id] = {start: Date.now(), end: 0}
        if (opt.tag) sw.list[sw.id].tag = opt.tag

        return {
            end: ()=>{
                this.end({type: opt.type, route: opt.route, id: sw.id})
            }
        }
    }

    end(opt){
        return

        var type = this.stats[opt.type]

        var route = type[opt.route]
        route.stopwatch.list[opt.id].end = Date.now()

        var timestamps = {
            start: route.stopwatch.list[opt.id].start,
            end: route.stopwatch.list[opt.id].end
        }

        timestamps.execTime = timestamps.end - timestamps.start

        route.stopwatch.list[opt.id].time = timestamps.execTime

        delete route.stopwatch.list[opt.id].start
        delete route.stopwatch.list[opt.id].end

        if (Object.keys(route.stopwatch.list).length > 5){
            delete route.stopwatch.list[Object.keys(route.stopwatch.list)[0]]
        }
    }

    reset(){
        for (var _t in this.stats){
            var type = this.stats[_t]

            for (var _r in type){
                var route = type[_r]
                route.perSec.secVal = Math.round(route.perSec.count / 5).toFixed(0)
                route.perSec.count = 0
            }
        }
    }


    purge(opt){
        //this one is supposed to ensure that not more than N measurements exist in any list
    }

    print(){
        return
        //var newStats = JSON.stringify(this.stats)

        //if (this.oldStats === newStats) return

        //console.log(this.stats.get)
        //console.log(this.stats.post)


        console.log('======    Stats    ======')
        for (var _t in this.stats){
            var type = this.stats[_t]


            console.log('    ' + _t)
            

            for (var _r in type){
                var route = type[_r]

                var execTime = ''
                for (var i in route.stopwatch.list){
                    if (route.stopwatch.list[i].time) execTime += '    ' + (route.stopwatch.list[i].tag ? `(${route.stopwatch.list[i]}) ` : '') + route.stopwatch.list[i].time
                }

                console.log(`      |- ${_r}    perSec: ${route.perSec.secVal}    time: ${execTime}`)
            }

            console.log('')
        }
    }
}