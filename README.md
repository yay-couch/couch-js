##Couch##

Simply port of [Couch](https://github.com/qeremy/couch) for Node.js.

Notice: See CouchDB's official documents before using this library.

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
// init couch object with default config
var couch = new Couch.Couch();

// init couch object with given config
var couch = new Couch.Couch(config);
// or
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
client.head(uri, options, callback);
client.get(uri, options, callback);
client.copy(uri, options, callback);
client.delete(uri, options, callback);
// with body
client.put(uri, options, callback);
client.post(uri, options, callback);

// after request operations
var request  = client.getRequest();
var response = client.getResponse();
```

#####Server Object#####
```js
var server = new Couch.Server(client);

// methods
server.ping(callback);
server.info(key|null, callback);
server.version(callback);
server.getActiveTasks(callback);
server.getAllDatabases(callback);
server.getDatabaseUpdates(query|null, callback);
server.getLogs(query|null, callback);
server.replicate(query={source: "foo", target: "foo2", create_target: true}, callback);
server.restart(callback);
server.getStats(path|null, callback);
server.getStats("/couchdb/request_time", callback);
server.getUuid(3, callback);
server.getConfig(section|null, key|null, callback);
server.getConfig("couchdb");
server.getConfig("couchdb", "uuid");
server.setConfig("couchdb", "foo", "the foo!");
server.removeConfig("couchdb", "foo");
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
