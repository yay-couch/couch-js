var Class = require("./util/class"),
    Util = require("./util/util"),
    Client = require("./client"),
    Query = require("./query"),
    Document = require("./document");

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
            return callback(stream, (data && data.rows && data.rows[0]) || null);
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
    },
    createDocument: function(document, callback){
        return this.createDocumentAll([document], function(stream, data){
            return callback(stream, (data && data[0]) || null);
        });
    },
    createDocumentAll: function(documents, callback){
        if (!documents || !documents.length) {
            throw new Error("Documents are required for create actions!");
        }
        var docs = [];
        documents.forEach(function(doc){
            if (!doc || typeof doc != "object") {
                throw new Error("Each document must be a valid JSON object!");
            }
            if (doc instanceof Document) {
                doc = doc.getData();
            }
            // this is create method, no update allowed
            if (doc._id)      delete doc._id;
            if (doc._rev)     delete doc._rev;
            if (doc._deleted) delete doc._deleted;
            docs.push(doc);
        });
        return this.client.post(this.name +"/_bulk_docs", {body: {"docs": docs}}, callback);
    },
    updateDocument: function(document, callback){
        return this.updateDocumentAll([document], function(stream, data){
            return callback(stream, (data && data[0]) || null);
        });
    },
    updateDocumentAll: function(documents, callback){
        if (!documents || !documents.length) {
            throw new Error("Documents are required for update actions!");
        }
        var docs = [];
        documents.forEach(function(doc){
            if (!doc || typeof doc != "object") {
                throw new Error("Each document must be a valid JSON object!");
            }
            if (doc instanceof Document) {
                doc = doc.getData();
            }
            // these are required params
            if (!doc._id || !doc._rev) {
                throw new Error("Both _id & _rev fields are required!");
            }
            docs.push(doc);
        });
        return this.client.post(this.name +"/_bulk_docs", {body: {"docs": docs}}, callback);
    },
    deleteDocument: function(document, callback){
        return this.deleteDocumentAll([document], function(stream, data){
            return callback(stream, (data && data[0]) || null);
        });
    },
    deleteDocumentAll: function(documents, callback){
        if (!documents || !documents.length) {
            throw new Error("Documents are required for delete actions!");
        }
        documents.map(function(doc){
            if (doc instanceof Document) {
                doc = doc.getData();
            }
            doc._deleted = true;
        });
        return this.updateDocumentAll(documents, callback);
    },
    getChanges: function(query, docIds, callback){
        query = query || {};
        if (!docIds || !docIds.length) {
            return this.client.get(this.name +"/_changes", {uriParams: query}, callback);
        }
        if (!query.filter) {
            query.filter = "_doc_ids";
        }
        return this.client.post(this.name +"/_changes", {uriParams: query, body: {"doc_ids": docIds}}, callback);
    },
    compact: function(ddoc, callback) {
        if (!ddoc) {
            return this.client.post(this.name +"/_compact", null, callback);
        } else {
            return this.client.post(this.name +"/_compact"+ ddoc, null, callback);
        }
    },
    ensureFullCommit: function(callback) {
        return this.client.post(this.name +"/_ensure_full_commit", null, callback);
    },
    viewCleanup: function(callback){
        return this.client.post(this.name +"/_view_cleanup", null, callback);
    },
    viewTemp: function(map, reduce, callback){
        return this.client.post(this.name +"/_temp_view", {body: {map: map, reduce: reduce}}, callback);
    },
    getSecurity: function(callback){
        return this.client.get(this.name +"/_security", null, callback)
    },
    setSecurity: function(admins, members, callback){
        if ((!admins || !admins.names || admins.roles) ||
            (!members || !members.names || members.roles)) {
            throw new Error("Specify admins and/or members with names=>roles fields!");
        }
        return this.client.put(this.name +"/_security", {body: {admins: admins, members: members}}, callback)
    }
});

module.exports = Database;
