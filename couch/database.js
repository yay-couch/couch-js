/**
 * Copyright 2015 Kerem Güneş
 *    <http://qeremy.com>
 *
 * Apache License, Version 2.0
 *    <http://www.apache.org/licenses/LICENSE-2.0>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Module objects.
 * @private
 */
var Class = require("./util/class"),
    Util = require("./util/util"),
    Client = require("./client"),
    Query = require("./query"),
    Document = require("./document");

/**
 * Database object.
 * @public
 *
 * @module Couch
 * @object Couch.Database
 * @author Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Database = Class.create("Database", {
    /**
     * Client object.
     * @type {Couch.Client}
     */
    client: null,

    /**
     * Database name.
     * @type {String}
     */
    name: undefined,

    /**
     * Object constructor.
     * @private
     *
     * @param  {Couch.Client} client
     * @param  {String}       name
     * @throws {Error}
     */
    __init__: function(client, name){
        // check client
        if (!isInstanceOf(client, Client)) {
            throw new Error("Given client must be instance of Couch.Client!");
        }
        // check name
        if (!name) {
            throw new Error("Name must be a valid database name!");
        }

        this.client = client, this.name = name;
    },

    /**
     * Ping database.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    ping: function(callback){
        this.client.head(this.name, null, callback);
    },
    info: function(key, callback) {
        this.client.get(this.name, null, function(stream){
            return callback(stream, stream.response.getData(key));
        });
    },
    create: function(callback){
        this.client.put(this.name, null, callback);
    },
    remove: function(callback){
        this.client.delete(this.name, null, callback);
    },
    replicate: function(target, targetCreate, callback) {
        this.client.post("/_replicate", {
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
        if (isInstanceOf(query, Query)) {
            query = query.toArray();
        } else if (typeof query == "string") {
            query = Query.parse(query);
        }
        query = query || {};
        if (query.include_docs == null) {
            query.include_docs = true;
        }
        if (!keys || !keys.length) {
            this.client.get(this.name +"/_all_docs", {uriParams: query}, callback);
        } else {
            this.client.post(this.name +"/_all_docs", {uriParams: query, body: {"keys": keys}}, callback);
        }
    },
    createDocument: function(document, callback){
        this.createDocumentAll([document], function(stream, data){
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
            if (isInstanceOf(doc, Document)) {
                doc = doc.getData();
            }
            // this is create method, no update allowed
            if (doc._id)      delete doc._id;
            if (doc._rev)     delete doc._rev;
            if (doc._deleted) delete doc._deleted;
            docs.push(doc);
        });
        this.client.post(this.name +"/_bulk_docs", {body: {"docs": docs}}, callback);
    },
    updateDocument: function(document, callback){
        this.updateDocumentAll([document], function(stream, data){
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
            if (isInstanceOf(doc, Document)) {
                doc = doc.getData();
            }
            // these are required params
            if (!doc._id || !doc._rev) {
                throw new Error("Both _id & _rev fields are required!");
            }
            docs.push(doc);
        });
        this.client.post(this.name +"/_bulk_docs", {body: {"docs": docs}}, callback);
    },
    deleteDocument: function(document, callback){
        this.deleteDocumentAll([document], function(stream, data){
            return callback(stream, (data && data[0]) || null);
        });
    },
    deleteDocumentAll: function(documents, callback){
        if (!documents || !documents.length) {
            throw new Error("Documents are required for delete actions!");
        }
        documents.map(function(doc){
            if (isInstanceOf(doc, Document)) {
                doc = doc.getData();
            }
            doc._deleted = true;
        });
        this.updateDocumentAll(documents, callback);
    },
    getChanges: function(query, docIds, callback){
        query = query || {};
        if (!docIds || !docIds.length) {
            this.client.get(this.name +"/_changes", {uriParams: query}, callback);
        } else {
            if (!query.filter) {
                query.filter = "_doc_ids";
            }
            this.client.post(this.name +"/_changes", {uriParams: query, body: {"doc_ids": docIds}}, callback);
        }
    },
    compact: function(ddoc, callback) {
        if (!ddoc) {
            this.client.post(this.name +"/_compact", null, callback);
        } else {
            this.client.post(this.name +"/_compact"+ ddoc, null, callback);
        }
    },
    ensureFullCommit: function(callback) {
        this.client.post(this.name +"/_ensure_full_commit", null, callback);
    },
    viewCleanup: function(callback){
        this.client.post(this.name +"/_view_cleanup", null, callback);
    },
    viewTemp: function(map, reduce, callback){
        this.client.post(this.name +"/_temp_view", {body: {map: map, reduce: reduce}}, callback);
    },
    getSecurity: function(callback){
        this.client.get(this.name +"/_security", null, callback)
    },
    setSecurity: function(admins, members, callback){
        if ((!admins || !admins.names || !admins.roles) ||
            (!members || !members.names || !members.roles)) {
            throw new Error("Specify admins and/or members with names=>roles fields!");
        }
        this.client.put(this.name +"/_security", {body: {admins: admins, members: members}}, callback)
    },
    purge: function(docId, docRevs, callback){
        this.client.post(this.name +"/_purge", {body: {docId: docRevs}}, callback);
    },
    getMissingRevisions: function(docId, docRevs, callback){
        this.client.post(this.name +"/_missing_revs", {body: {docId: docRevs}}, callback);
    },
    getMissingRevisionsDiff: function(docId, docRevs, callback){
        this.client.post(this.name +"/_revs_diff", {body: {docId: docRevs}}, callback);
    },
    getRevisionLimit: function(callback){
        this.client.get(this.name +"/_revs_limit", null, callback);
    },
    setRevisionLimit: function(limit, callback){
        this.client.put(this.name +"/_revs_limit", {body: limit}, callback);
    }
});

module.exports = Database;
