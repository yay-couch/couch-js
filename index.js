// module.exports = require('./couch/couch');

var log = function(){
    return console.log.apply(this, arguments);
};

var Couch = require('./couch/couch');
// log(Couch)

// var cfg = {host:"127.0.0.1"};
var couch = new Couch.Couch();
var client = new Couch.Client(couch);

// client.request("POST /_aaa").done(function(req, res){
//     // log(req)
//     // log(req.headers)
//     // log(req.body)
//     // log(req.toString())
//     // log("---")
//     // log(res)
//     // log(res.headers)
//     // log(res.body)
//     // log(res.toString())
// });

client.request({
    method: "HEAD",
    uri: "/",
    uriParams: {a:1},
    body: {b:2},
    headers: {"X-Foo":"The foo!"}
}).done(function(req, res){
    // log(req.headers)
    // log(req.body)
    log(req.toString())
    log("---")
    // log(res.headers)
    // log(res.body)
    log(res.toString())
});

