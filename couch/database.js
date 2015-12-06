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

    /**
     * Get database info.
     * @public @async
     *
     * @param  {String|void} key
     * @param  {Function}    callback
     * @return {void}
     */
    info: function(key, callback) {
        this.client.get(this.name, null, function(stream){
            return callback(stream, stream.response.getData(key));
        });
    },

    /**
     * Create database.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    create: function(callback){
        this.client.put(this.name, null, callback);
    },

    /**
     * Remove database.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    remove: function(callback){
        this.client.delete(this.name, null, callback);
    },

    /**
     * Replicate database.
     * @public @async
     *
     * @param  {String}   target
     * @param  {Boolean}  targetCreate
     * @param  {Function} callback
     * @return {void}
     */
    replicate: function(target, targetCreate, callback) {
        this.client.post("/_replicate", {
            body: {source: this.name, target: target,
                create_target: (targetCreate !== false)
            }
        }, callback);
    },

    /**
     * Get a document.
     * @public @async
     *
     * @param  {String}   key
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    getDocument: function(key, callback) {
        if (!key) {
            throw new Error("Document key is required!");
        }

        // quote key
        key = Util.format('"%s"', Util.quote(key));

        this.client.get(this.name +"/_all_docs", {
            uriParams: {include_docs: true, key: key}
        }, function(stream, data){
            return callback(stream, (data && data.rows && data.rows[0]) || null);
        });
    },

    /**
     * Get all documents.
     * @public @async
     *
     * @param  {Object|String|Couch.Query} query
     * @param  {Array}                     keys
     * @param  {Function}                  callback
     * @return {void}
     */
    getDocumentAll: function(query, keys, callback){
        // convert query to plain object
        if (isInstanceOf(query, Query)) {
            query = query.toArray();
        } else if (typeof query == "string") {
            query = Query.parse(query);
        }

        query = query || {};
        // ensure include documents
        if (query.include_docs == null) {
            query.include_docs = true;
        }

        // if no keys provided
        if (!keys || !keys.length) {
            this.client.get(this.name +"/_all_docs",
                {uriParams: query}, callback);
        } else {
            this.client.post(this.name +"/_all_docs",
                {uriParams: query, body: {keys: keys}}, callback);
        }
    },

    /**
     * Create a document.
     * @public @async
     *
     * @param  {Object|Couch.Document} document
     * @param  {Function}              callback
     * @return {void}
     * @throws {Error}
     */
    createDocument: function(document, callback){
        this.createDocumentAll([document], function(stream, data){
            return callback(stream, (data && data[0]) || null);
        });
    },

    /**
     * Create multiple documents.
     * @public @async
     *
     * @param  {Array}    documents
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    createDocumentAll: function(documents, callback){
        if (!documents || !documents.length) {
            throw new Error("Documents are required for create actions!");
        }

        var docs = [];
        documents.forEach(function(doc){
            if (!doc || typeof doc != "object") {
                throw new Error("Each document must be a valid JSON object!");
            }

            // serialize document
            if (isInstanceOf(doc, Document)) {
                doc = doc.getData();
            }

            // this is create method, no update allowed
            if (doc._id)      delete doc._id;
            if (doc._rev)     delete doc._rev;
            if (doc._deleted) delete doc._deleted;

            docs.push(doc);
        });

        this.client.post(this.name +"/_bulk_docs", {body: {docs: docs}}, callback);
    },

    /**
     * Update a document.
     * @public @async
     *
     * @param  {Object|Couch.Document} document
     * @param  {Function}              callback
     * @return {void}
     * @throws {Error}
     */
    updateDocument: function(document, callback){
        this.updateDocumentAll([document], function(stream, data){
            return callback(stream, (data && data[0]) || null);
        });
    },

    /**
     * Update multiple documents.
     * @public @async
     *
     * @param  {Array}    documents
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    updateDocumentAll: function(documents, callback){
        if (!documents || !documents.length) {
            throw new Error("Documents are required for update actions!");
        }

        var docs = [];
        documents.forEach(function(doc){
            if (!doc || typeof doc != "object") {
                throw new Error("Each document must be a valid JSON object!");
            }

            // serialize document
            if (isInstanceOf(doc, Document)) {
                doc = doc.getData();
            }

            // these are required params
            if (!doc._id || !doc._rev) {
                throw new Error("Both _id & _rev fields are required!");
            }

            docs.push(doc);
        });

        this.client.post(this.name +"/_bulk_docs", {body: {docs: docs}}, callback);
    },

    /**
     * Delete a document.
     * @public @async
     *
     * @param  {Object|Couch.Document} document
     * @param  {Function}              callback
     * @return {void}
     * @throws {Error}
     */
    deleteDocument: function(document, callback){
        this.deleteDocumentAll([document], function(stream, data){
            return callback(stream, (data && data[0]) || null);
        });
    },

    /**
     * Delete multiple documents.
     * @public @async
     *
     * @param  {Array}    documents
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    deleteDocumentAll: function(documents, callback){
        if (!documents || !documents.length) {
            throw new Error("Documents are required for delete actions!");
        }

        documents.map(function(doc){
            // serialize document
            if (isInstanceOf(doc, Document)) {
                doc = doc.getData();
            }

            // just add _deleted flag
            doc._deleted = true;
        });

        this.updateDocumentAll(documents, callback);
    },

    /**
     * Get database changes.
     * @public @async
     *
     * @param  {Object}   query
     * @param  {Array}    docIds
     * @param  {Function} callback
     * @return {void}
     */
    getChanges: function(query, docIds, callback){
        query = query || {};
        if (!docIds || !docIds.length) {
            this.client.get(this.name +"/_changes",
                {uriParams: query}, callback);
        } else {
            if (!query.filter) {
                query.filter = "_doc_ids";
            }
            this.client.post(this.name +"/_changes",
                {uriParams: query, body: {doc_ids: docIds}}, callback);
        }
    },

    /**
     * Compact database.
     * @public @async
     *
     * @param  {String}   ddoc
     * @param  {Function} callback
     * @return {void}
     */
    compact: function(ddoc, callback) {
        if (!ddoc) {
            this.client.post(this.name +"/_compact", null, callback);
        } else {
            this.client.post(this.name +"/_compact"+ ddoc, null, callback);
        }
    },

    /**
     * Ensure full-commit.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    ensureFullCommit: function(callback) {
        this.client.post(this.name +"/_ensure_full_commit", null, callback);
    },

    /**
     * Remove unneded view index files.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    viewCleanup: function(callback){
        this.client.post(this.name +"/_view_cleanup", null, callback);
    },

    /**
     * Create (and execute) a temporary view.
     * @public @async
     *
     * @param  {String}   map
     * @param  {String}   reduce
     * @param  {Function} callback
     * @return {void}
     */
    viewTemp: function(map, reduce, callback){
        this.client.post(this.name +"/_temp_view",
            {body: {map: map, reduce: reduce}}, callback);
    },

    /**
     * Get the current security object of the database.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    getSecurity: function(callback){
        this.client.get(this.name +"/_security", null, callback)
    },

    /**
     * Set the security object for the database.
     * @public @async
     *
     * @param  {Object}   admins
     * @param  {Object}   members
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    setSecurity: function(admins, members, callback){
        if ((!admins || !admins.names || !admins.roles) ||
            (!members || !members.names || !members.roles)) {
            throw new Error("Specify admins and/or members with names=>roles fields!");
        }

        this.client.put(this.name +"/_security",
            {body: {admins: admins, members: members}}, callback)
    },

    /**
     * Permanently remove the references to deleted documents from the database.
     * @public @async
     *
     * @param  {String}   docId
     * @param  {Array}    docRevs
     * @param  {Function} callback
     * @return {void}
     */
    purge: function(docId, docRevs, callback){
        this.client.post(this.name +"/_purge",
            {body: {docId: docRevs}}, callback);
    },

    /**
     * Get the document revisions that do not exist in the database.
     * @public @async
     *
     * @param  {String}   docId
     * @param  {Array}    docRevs
     * @param  {Function} callback
     * @return {void}
     */
    getMissingRevisions: function(docId, docRevs, callback){
        var body = {};
        body[docId] = docRevs;
        this.client.post(this.name +"/_missing_revs", {body: body}, callback);
    },

    /**
     * Get the subset of those that do not correspond to revisions stored in the database.
     * @public @async
     *
     * @param  {String}   docId
     * @param  {Array}    docRevs
     * @param  {Function} callback
     * @return {void}
     */
    getMissingRevisionsDiff: function(docId, docRevs, callback){
        this.client.post(this.name +"/_revs_diff",
            {body: {docId: docRevs}}, callback);
    },

    /**
     * Get the current "revs_limit" (revision limit) setting.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    getRevisionLimit: function(callback){
        this.client.get(this.name +"/_revs_limit", null, callback);
    },

    /**
     * Set the current "revs_limit" (revision limit) setting.
     * @public @async
     *
     * @param {Number}   limit
     * @param {Function} callback
     */
    setRevisionLimit: function(limit, callback){
        this.client.put(this.name +"/_revs_limit", {body: limit}, callback);
    }
});

/**
 * Expose module.
 */
module.exports = Database;
