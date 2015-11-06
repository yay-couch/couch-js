// module.exports = require('./couch/couch');

function log(){
    return console.log.apply(this, arguments);
}
function dump(req, res){}
function dumpRaw(req, res){
    log(req.toString());
    log(res.toString());
}

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

// client.request({
//     method: "HEAD",
//     uri: "/",
//     uriParams: {a:1},
//     body: {b:2},
//     headers: {"X-Foo":"The foo!"}
// }).done(function(req, res){
//     // log(req.headers)
//     // log(req.body)
//     log(req.toString())
//     log("---")
//     // log(res.headers)
//     // log(res.body)
//     log(res.toString())
// });

var server = new Couch.Server(client);
// server.ping(function(stream){
//     console.log(stream.error);
//     console.log(stream.request.toString());
//     console.log(stream.response.toString());
//     console.log("%j", stream.response.isStatusCode(200));
// });
// server.info(null, function(stream, data){
//     console.log(data);
// });
// server.info("vendor.name", function(stream, data){
//     console.log(data);
// });
// server.version(function(stream, data){
//     console.log(data);
// });
// server.getActiveTasks(function(stream, data){
//     console.log(data);
// });
// server.getAllDatabases(function(stream, data){
//     console.log(data);
// });
// server.getDatabaseUpdates(function(stream, data){
//     console.log(data);
// });
// server.getLogs(null, function(stream, data){
//     console.log(data);
// });
// server.replicate({source:"foo", target:"foo_replica", create_target:true}, function(stream, data){
//     console.log(data);
// });
