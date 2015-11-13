##Couch##

Simply port of [Couch](https://github.com/qeremy/couch) for Node.js.

Notice: See CouchDB's official documents before using this library.

**Symbols on README**

- `foo"" = String foo`
- `foo{} = Object foo`
- `foo[] = Array foo`
- `foo%  = Number foo`
- `foo!  = Boolean foo`
- `foo?  = Mixed foo`
- `?foo"" = Nullable String foo`

##In a Nutshell##

```js
// create a fresh document
var doc = new Couch.Document(client);
doc.name = "The Doc!";
doc.save();

// append an attachment
doc.setAttachment(new Couch.DocumentAttachment(doc, "./file.txt"));
doc.save();
```

##Install##
```sh
$~ npm install qeremy-couch
```

##Configuration##

Configuration is optional but you can provide all these options;

```js
var config = {};

// default=localhost
config.host = "couchdb_host";
// default=5984
config.port = 1234;
// default=null
config.username = "couchdb_user";
// default=null
config.password = "************";
```

##Objects##

#####Couch Object#####
```js
var Couch = require("qeremy-couch");

// init couch object with default config
var couch = new Couch.Couch();

// init couch object with given config
var couch = new Couch.Couch(config);

// or set later but before streaming
var couch = new Couch.Couch();
couch.setConfig(config);
```

#####Client Object#####
```js
// used in Server and Database objects
var client = new Couch.Client(couch);
```
If you need any direct request for any reason, you can use the methods below.
```js
var options = {}; // could be null too

client.request("GET /", options).done(function(stream, data){
    console.log(stream.request.toString());
    console.log(stream.response.toString());
    console.log(data); // rendered response data
});

// or with fulfilled options
options.method    = Couch.Request.METHOD.GET;
options.uri       = "/";
options.uriParams = {foo: 1};
options.body      = null; // object or string or null
options.headers   = {"X-Foo": "Bar"};

client.request(options).done(function(stream, data){
    // ...
});

// shortcut methods that handle HEAD, GET, POST, PUT, COPY, DELETE
client.head(uri"", options{}, callback);
client.get(uri"", options{}, callback);
client.copy(uri"", options{}, callback);
client.delete(uri"", options{}, callback);
// with body
client.put(uri"", options{}, callback);
client.post(uri"", options{}, callback);

// after request operations
var request  = client.getRequest();
var response = client.getResponse();
```

Notice: All callback's get only two params (stream, data)

- stream = {error,request,response} (Object)
- data   = {response.data}          (Object|String|Boolean|null) // rendered
```js
server.ping(function(stream, data){
    console.log("%j", stream.response.isStatusCode(200));
    console.log("%j", (200 === stream.response.getStatusCode()));
    console.log(data.length); // 0
});
server.version(function(stream, data){
    console.log(data); // 1.5.0
});
```

#####Server Object#####
```js
var server = new Couch.Server(client);

// methods
server.ping(callback);
server.info(?key"", callback);
server.version(callback);

server.getActiveTasks(callback);
server.getAllDatabases(callback);
server.getDatabaseUpdates(query{}?, callback);
server.getLogs(query?, callback);

server.restart(callback);
server.replicate(query={source: "foo", target: "foo2",
    create_target: true}, callback);

server.getStats(?path"", callback);
server.getStats("/couchdb/request_time", callback);

server.getUuid(?limit%, callback); // get one
server.getUuid(3, callback);       // get three

server.getConfig(?section"", ?key"", callback);
server.getConfig("couchdb", "", callback);
server.getConfig("couchdb", "uuid", callback);
server.setConfig("couchdb", "foo", "the foo!", callback);
server.removeConfig("couchdb", "foo", callback);
```

#####Database Object#####
```js
var db = new Couch.Database(client, "foo");

// db methods
db.ping(callback);
db.info(?key"", callback);
db.create(callback);
db.remove(callback);
db.replicate(target"", targetCreate!, callback);
db.getChanges(?query{}, ?docIds[], callback);
db.compact(ddoc"", callback);
db.ensureFullCommit(callback);
db.viewCleanup(callback);
db.getSecurity(callback);
db.setSecurity(admins{}, members{}, callback);

db.getRevisionLimit(callback);
db.setRevisionLimit(limit%, callback);

/** tmp view method  */
db.viewTemp(map"", callback);
db.viewTemp(map"", reduce"", callback);

/** document methods  */
db.purge(docId"", docRevs[], callback);
db.getMissingRevisions(docId"", docRevs[], callback);
db.getMissingRevisionsDiff(docId"", docRevs[], callback);

// get a document
db.getDocument(key"", callback);
// get all documents
db.getDocumentAll(?query?, ?keys[], callback);

// create a document
var doc = new Couch.Document();
doc.name = "test";
// param as Couch.Document
db.createDocument(doc);
// param as object
db.createDocument({name: "test"});

// update a document
doc = new Couch.Document();
doc._id = "e90636c398458a9d5969d2e71b04ad81";
doc._rev = "3-9aeefae43b9fad5df8cc87fe8bcc2718";
// param as Couch.Document
db.updateDocument(doc);
// param as array
db.updateDocument({
     "_id": "e90636c398458a9d5969d2e71b04b0a4",
    "_rev": "1-afa338dcbc6870f1a1dd441557f79859",
    "test": "test (update)"
});

// delete a document
doc = new Couch.Document(null, {
     "_id": "e90636c398458a9d5969d2e71b04b0a4",
    "_rev": "1-afa338dcbc6870f1a1dd441557f79859",
});
db.deleteDocument(doc);

/** multiple CRUD */
var docs = [];

// all accepted, just fill the doc data
docs.push({/* doc data id etc (and rev for updade/delete) */});
docs.push(new Couch.Document(null,
    {/* doc data id etc (and rev for updade/delete) */}));
doc = new Couch.Document();
doc.foo = "...";
docs.push(doc);

// multiple create
db.createDocumentAll(docs);
// multiple update
db.updateDocumentAll(docs);
// multiple delete
db.deleteDocumentAll(docs);
```

#####Document Object#####
```js
var doc = new Couch.Document(db);
// set props (so data)
doc._id = "e90636c398458a9d5969d2e71b04b2e4";
doc._rev = "2-393dbbc2cca7eea546a3c750ebeddd70";

// checker method
doc.ping(callback);

// CRUD methods
doc.find(?query{}, callback);
doc.remove(batch!, fullCommit!, callback);
// create
doc.save(batch!, fullCommit!, callback);
// update
doc._id = "abc";
doc._rev = "1-abc";
doc.save(batch!, fullCommit!, callback);

// copy methods
doc.copy(dest"", batch!, fullCommit!, callback);
doc.copyFrom(dest"", batch!, fullCommit!, callback);
doc.copyTo(dest"", destRev"", batch!, fullCommit!, callback);

// find revisions
doc.findRevisions(callback);
doc.findRevisionsExtended(callback);

// find attachments
doc.findAttachments(attEncInfo!, attsSince[], callback);

// add attachments
doc.setAttachment({file: "./file.txt"}); // name goes to be file.txt
doc.setAttachment({file: "./file.txt", file_name: "my_file_name"});
doc.setAttachment(new Couch.DocumentAttachment(doc, "./file.txt"));
doc.save();

// to json/array
String doc.toJson();
Object doc.toArray();
```

#####DocumentAttachment Object#####
```js
var attc = new Couch.DocumentAttachment(doc);

// ping attachment
attc.ping(callback);

// find an attachment
attc.fileName = "my_attc_name";
attc.find(callback);

// find an attachment by digest
attc.fileName = "my_attc_name";
attc.digest   = "U1p5BLvdnOZVRyR6YrXBoQ==";
attc.find(callback);

// add an attachment to document
attc.file     = "attc.txt";
attc.fileName = "my_attc_name";
attc.save(callback);

// remove an attachment from document
attc.fileName = "my_attc_name";
attc.remove();

// to json/array
String attc.toJson();
Object attc.toArray();
```

#####DocumentDesign Object#####
```js
// @todo
```

##Uuid##
```js
// create uuid given value
var uuid = new Couch.Uuid("my_uuid");
// auto-generate using Math.random() => 32 length hexed
var uuid = new Couch.Uuid(true);

// also setValue & getValue methods available
var uuid = new Couch.Uuid();
uuid.setValue("my_uuid");

// print
console.log(uuid.toString());

// generate method (default=HEX_32)
var uuidValue = Couch.Uuid.generate(?limit%);
var uuidValue = Couch.Uuid.generate(Couch.Uuid.HEX_40);

// available limits
HEX_8 = 8;
HEX_32 = 32;
HEX_40 = 40;
TIMESTAMP = 0;
```

##Query##
```js
// init query
var query = new Couch.Query();
// init query with data (params)
var query = new Couch.Query({foo: 1});

// add params
query.set("conflicts", true)
    .set("stale", "ok")
    .skip(1)
    .limit(2);

// get as string
console.log(query.toString());

// use it!
db.getDocumentAll(query, ?keys[], callback);
```

##Request / Response##
```js
// after any http stream (server ping, database ping, document save etc)
client.request("GET /").done(function(stream, data){
    // actually callback's stream param contains request/response
    // objects that could be retrieved by getRequest()/getResponse()
    // >> true
    console.log("%j", stream.request === client.getRequest());

    // dump raw stream
    console.log(client.getRequest().toString());
    console.log(client.getResponse().toString());

    // get response body
    console.log(client.getResponse().getBody());

    // get response data (rendered)
    console.log(client.getResponse().getData());
    // >> { version: '14.04', name: 'Ubuntu' }
    console.log(client.getResponse().getData("vendor"));
    // >> Ubuntu
    console.log(client.getResponse().getData("vendor.name"));
});

/*
GET / HTTP/1.1
Host: localhost:5984
Connection: close
Accept: application/json
Content-Type: application/json
User-Agent: Couch/v1.0 (+http://github.com/qeremy/couch-js)


HTTP/1.1 200 OK
Server: CouchDB/1.5.0 (Erlang OTP/R16B03)
Date: Fri, 13 Nov 2015 02:45:12 GMT
Content-Type: application/json
Content-Length: 127
Cache-Control: must-revalidate

{"couchdb":"Welcome","uuid":"5a660f4695a5fa9ab2cd22722bc01e96", ...
*/
```

##Error Handling##

Couch will not throw any server response error, such as `409 Conflict` etc. It only throws library-related errors or wrong usages of the library (ie. when `_id` is required for some action but you did not provide it).

```js
// create issue
var doc = new Couch.Document();
doc._id = "an_existing_docid";

// no error will be thrown
doc.save(function(stream, data){
    // but could be so
    if (!stream.response.isStatusCode(201)) {
        console.log("nö!");
        // or log response error data
        console.log(data.error);
        console.log(data.reason);
    }
});
```

##Structure##
```js
// console.log(Couch);
{ NAME: 'Couch',
  VERSION: '1.0',
  Couch: [Function],
  Util:
   { extend: [Function],
     format: [Function],
     quote: [Function],
     forEach: [Function],
     execSync: [Function],
     fileInfo: [Function],
     fileExists: [Function],
     Base64: { encoding: 'utf-8', encode: [Function], decode: [Function] } },
  Class: { create: [Function], extend: [Function] },
  Stream:
   { [Function: Class]
     nameOrig: 'Stream',
     init: [Function],
     TYPE: { REQUEST: 1, RESPONSE: 2 } },
  Request:
   { [Function: Class]
     nameOrig: 'Request',
     METHOD:
      { HEAD: 'HEAD',
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE',
        COPY: 'COPY' } },
  Response:
   { [Function: Class]
     nameOrig: 'Response',
     STATUS:
      { '200': 'OK',
        '201': 'Created',
        '202': 'Accepted',
        '304': 'Not Modified',
        '400': 'Bad Request',
        '401': 'Unauthorized',
        '403': 'Forbidden',
        '404': 'Not Found',
        '405': 'Resource Not Allowed',
        '406': 'Not Acceptable',
        '409': 'Conflict',
        '412': 'Precondition Failed',
        '415': 'Bad Content Type',
        '416': 'Requested Range Not Satisfiable',
        '417': 'Expectation Failed',
        '500': 'Internal Server Error' } },
  Client: { [Function: Class] nameOrig: 'Client' },
  Server: { [Function: Class] nameOrig: 'Server' },
  Database: { [Function: Class] nameOrig: 'Database' },
  Document: { [Function: Class] nameOrig: 'Document' },
  DocumentAttachment: { [Function: Class] nameOrig: 'DocumentAttachment' },
  DocumentDesign: { [Function: Class] nameOrig: 'DocumentDesign' },
  Query: { [Function: Class] nameOrig: 'Query', parse: [Function] },
  Uuid:
   { [Function: Class]
     nameOrig: 'Uuid',
     generate: [Function],
     HEX_8: 8,
     HEX_32: 32,
     HEX_40: 40,
     TIMESTAMP: 0 } }
```
