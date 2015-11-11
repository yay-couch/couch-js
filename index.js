// module.exports = require('./couch/couch');

function log(){
    return console.log.apply(this, arguments);
}
function logStream(stream){
    console.log(stream.request.toString());
    console.log(stream.response.toString());
}
function logData(stream, data){
    console.log(data);
}
global.log = log; // tmp

var Couch = require('./couch/couch');
// log(Couch)

var couch = new Couch.Couch();
// var couch = new Couch.Couch({host:"127.0.0.1"});
var client = new Couch.Client(couch);

// client.request("POST /!!!BOOOOOOM!!!").done(function(stream, data){
//     // log(data)
//     // log(stream.request.headers)
//     // log(stream.request.body)
//     // log(stream.request.toString())
//     // log("---")
//     // log(stream.response.headers)
//     // log(stream.response.body)
//     // log(stream.response.toString())
//});

// client.request({
//     method: "HEAD",
//     uri: "/",
//     uriParams: {a:1},
//     body: {b:2},
//     headers: {"X-Foo":"The foo!"}
// }).done(function(stream, data){
//     // log(stream.request.headers)
//     // log(stream.request.body)
//     // log(stream.request.toString())
//     // log("---")
//     // log(stream.response.headers)
//     // log(stream.response.body)
//     // log(stream.response.toString())
// });

var server = new Couch.Server(client);
// server.ping(function(stream){
//     console.log(stream.error);
//     console.log(stream.request.toString());
//     console.log(stream.response.toString());
//     console.log("%j", stream.response.isStatusCode(200));
// });
// server.restart(function(stream, data){
//     console.log(data);
// });
// ver.info(null, function(stream, data){
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
// server.getStats("", function(stream, data){
// // server.getStats("/couchdb/request_time", function(stream, data){
//     console.log(data);
// });
// server.getUuid(null, function(stream, data){
// // server.getUuid(3, function(stream, data){
//     console.log(data);
// });
// // server.getConfig(null, null, function(stream, data){
// // server.getConfig("couchdb", null, function(stream, data){
// server.getConfig("couchdb", "uuid", function(stream, data){
//     console.log(data);
// });
// server.setConfig("couchdb", "foo", "the foo!", function(stream, data){
//     console.log(data !== false);
// });
// server.removeConfig("couchdb", "_", function(stream, data){
//     console.log(data !== false);
// });

// var uuid = new Couch.Uuid();
// console.log(uuid.toString())

var database = new Couch.Database(client, "foo");
// database.ping(function(stream){
//     console.log("%j", stream.response.isStatusCode(200));
// });
// database.info(null, function(stream, data){
//     console.log(data);
// });
// database.info("db_name", function(stream, data){
//     console.log(data);
// });
// database.create(function(stream, data){
//     console.log(data)
// });
// database.remove(function(stream, data){
//     console.log(data)
// });
// database.replicate("foo_new", true, function(stream, data){
//     console.log(data)
// });
// database.getDocument("5db345a5f26484352ea5d813180031fb", function(stream, data){
//     log(data)
// });
// database.getDocumentAll({}, null, function(stream, data){
//     log(data)
// });
// database.getDocumentAll({}, ["5db345a5f26484352ea5d813180031fb"], function(stream, data){
//     for (var i in data.rows) {
//         log(data.rows[i].doc)
//     }
// });
// var doc = new Couch.Document(database, {"title": "The Book 3", "price": 3.5});
// database.createDocument(doc, function(stream, data){
//     logStream(stream)
// });
// database.createDocumentAll([
//     {"title": "The Book 1", "price": 1.5},
//     {"title": "The Book 2", "price": 2.5},
//     doc
// ], function(stream, data){
//     logStream(stream)
// });
// var doc = {"title": "The Book 1 (update 1)", "price": 1.55,
//     _id: "7f9231672eac835f0e39e52357000e02", _rev: "2-af60c1cd15fdc44575a7fbd3bef69441"};
// database.updateDocument(doc, function(stream, data){
//     logStream(stream)
// });
// database.updateDocumentAll([
//     {"title": "The Book 1 (update)", "price": 1.55,
//         _id: "7f9231672eac835f0e39e52357000e02", _rev: "1-df359e8057e2b1a924649beeb844d225"}
// ], function(stream, data){
//     logStream(stream)
// });
// database.deleteDocument(
//     {_id:"7f9231672eac835f0e39e52357000e02", _rev:"4-ca14d6a6e24e5596975d8f5a989d6085"}
// , function(stream, data){
//     logStream(stream)
// });
// database.deleteDocumentAll([
//     {_id:"7f9231672eac835f0e39e52357000e02", _rev:"4-ca14d6a6e24e5596975d8f5a989d6085"},
//     {_id:"7f9231672eac835f0e39e52357000e02", _rev:"1-ca14d6a6e24e5596975d8f5a989d6085"}
// ], function(stream, data){
//     logStream(stream)
// });
// database.getChanges(null, ["7f9231672eac835f0e39e52357000e02"], function(stream, data){
//     logStream(stream)
// });
// database.compact(null, function(stream, data){
//     logStream(stream)
// });
// database.ensureFullCommit(function(stream, data){
//     logStream(stream)
// });
// database.viewCleanup(function(stream, data){
//     logStream(stream)
// });
// var map = "function(doc){if(doc.name) emit(doc,null)}"
// database.viewTemp(map, null, function(stream, data){
//     logStream(stream)
// });
// database.getSecurity(function(stream, data){
//     logStream(stream)
// });
// database.setSecurity(
//     {names: ["superuser"], roles: ["admins"]},
//     {names: ["user1","user2"], roles: ["developers"]}
// , function(stream, data){
//     logStream(stream)
// });
// database.purge("7f9231672eac835f0e39e52357000e02", ["4-ca14d6a6e24e5596975d8f5a989d6085"], function(stream, data){
//     logStream(stream)
// });
// database.getMissingRevisions("7f9231672eac835f0e39e52357000e02", ["4-ca14d6a6e24e5596975d8f5a989d6085"], function(stream, data){
//     logStream(stream)
// });
// database.getMissingRevisionsDiff("7f9231672eac835f0e39e52357000e02", ["4-ca14d6a6e24e5596975d8f5a989d6085"], function(stream, data){
//     logStream(stream)
// });
// database.getRevisionLimit(function(stream, data){
//     logStream(stream)
// });
// database.setRevisionLimit(1001, function(stream, data){
//     logStream(stream)
// });

// var doc = new Couch.Document(database);
// doc._id = "7f9231672eac835f0e39e52357001b65";
// doc.ping(function(stream){
//     log(200 === stream.response.getStatusCode())
// });
// doc._rev = "1-46161cd1c19c997587252320e8757c42";
// doc.ping(function(stream){
//     log(200 === stream.response.getStatusCode() || 304 === stream.response.getStatusCode())
// });
// doc.find({}, logStream)
// doc.findRevisions(logData)
// doc.findRevisionsExtended(logData)

// var db = new Couch.Database(client, "foo2"),
//     doc = new Couch.Document(db);
// doc._id = "attc_test";
// doc._rev = "1-attc_test";
// doc.findAttachments(true, ["2-6a0508cce9d2b4f3b83159648415c5e0"], function(s, data){
//     log(data)
// })

var db = new Couch.Database(client, "foo2");
var doc = new Couch.Document(db);
doc._id = "attc_test";
doc._rev = "8-18f21d151c7d89cdd2562d4546d054c2";
var docAttc = new Couch.DocumentAttachment(doc, "./test/attc1.txt");
// log(docAttc)

// docAttc.fileName = "attc.txt";
// docAttc.digest = "U1p5BLvdnOZVRyR6YrXBoQ==";
// docAttc.ping(logStream);
// docAttc.find(logStream);
// docAttc.save(logStream);
