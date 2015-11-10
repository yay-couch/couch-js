var Class = require("./util/class"),
    Util = require("./util/util"),
    Client = require("./client"),
    Query = require("./query");

var Database = Class.create("Database", {
    client: null,
    name: undefined,
    __init__: function(client, name){
        if (!client || !(client instanceof Client)) {
            throw new Error("Given client must be instance of Couch.Client!");
        }
        if (!name) {
            throw new Error("Name must be a valid database name!");
        }
        this.client = client;
        this.name = name;
    },
    ping: function(callback){
        return this.client.head(this.name, null, callback);
    },
    info: function(key, callback) {
        return this.client.get(this.name, null, function(stream){
            return callback(stream, stream.response.getData(key));
        });
    },
    create: function(callback){
        return this.client.put(this.name, null, callback);
    },
    remove: function(callback){
        return this.client.delete(this.name, null, callback);
    },
    replicate: function(target, targetCreate, callback) {
        return this.client.post("/_replicate", {
            body: {"source": this.name, "target": target, "create_target": (targetCreate !== false)}
        }, callback);
    },
    getDocument: function(key, callback) {
        if (!key) {
            throw new Error("Document is required!");
        }
        this.client.get(this.name +"/_all_docs", {
            uriParams: {"include_docs": true, "key": (key ? Util.format('"%s"', Util.quote(key)) : "")}
        }, function(stream, data){
            return callback(stream, (data && data.rows[0]) || null);
        });
    },
    getDocumentAll: function(query, keys, callback){
        if (query instanceof Query) {
            query = query.toArray();
        } else if (typeof query == "string") {
            query = Query.parse(query);
        }
        query = query || {};
        if (query.include_docs == null) {
            query.include_docs = true;
        }
        if (!keys || !keys.length) {
            return this.client.get(this.name +"/_all_docs", {uriParams: query}, callback);
        } else {
            return this.client.post(this.name +"/_all_docs", {uriParams: query, body: {"keys": keys}}, callback);
        }
    }
});

module.exports = Database;
