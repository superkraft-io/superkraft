var fs = require("fs");

module.exports = class SK_Terminal {

    query(text, callback){
        return new Promise((resolve, reject)=>{
            process.stdin.resume()
            process.stdout.write(text)
            process.stdin.once("data", function (data) {
                resolve(data.toString().trim())
            })
        })
    }
    
    printLinesWaitForQuestions(lines) {
        return new Promise((resolve, reject)=>{
            function continueProcessing() {
                if (lines.length) {
                    printNextLine(lines.pop());
                } else {
                    resolve()
                }
            }
        
            function printNextLine(line) {
                if (/\?$/.test(line)) {
                    this.query(line, function (response) {
                        console.log(response)
                        process.stdin.pause()
                        continueProcessing()
                    });
                } else {
                    console.log(line)
                    continueProcessing()
                }
            }
        
            continueProcessing()
        })
    }
}