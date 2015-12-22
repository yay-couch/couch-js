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
    Uuid = require("./uuid"),
    Database = require("./database"),
    DocumentAttachment = require("./document_attachment");

/**
 * Document object.
 * @public
 *
 * @module Couch
 * @object Couch.Document
 * @author Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Document = Class.create("Document", {
    /**
     * Document _id.
     * @type {String}
     */
    _id: undefined,

    /**
     * Document _rev.
     * @type {String}
     */
    _rev: undefined,

    /**
     * Document _deleted flag.
     * @type {Boolean}
     */
    _deleted: false,

    /**
     * Document _attachments.
     * @type {Object}
     */
    _attachments: {},

    /**
     * Document database object.
     * @type {Couch.Database}
     */
    database: null,

    /**
     * Document data.
     * @type {Object}
     */
    data: {
        _id: undefined,
        _rev: undefined,
        _deleted: false,
        _attachments: {}
    },

    /**
     * Object constructor.
     * @private
     *
     * @param {Couch.Database} database
     * @param {Object}         data
     */
    __init__: function(database, data){
        if (database) this.database = database;
        if (data)     this.setData(data);

        var $this = this;

        // define setter/getter's
        ["_id", "_rev", "_deleted"].forEach(function(key){
            Object.defineProperty($this, key, {
                get: function(){
                    var value = $this.data[key];
                    // normalize _id
                    if (key == "_id" && isInstanceOf(value, Uuid)) {
                        value = value.toString();
                    }
                    return value;
                },
                set: function(value){
                    // _id to uuid object
                    if (key == "_id") {
                        value = new Uuid(value);
                    }
                    $this.data[key] = value;
                }
            });
        });
    },

    /**
     * Serialize document data.
     * @public
     *
     * @return {String}
     */
    toJson: function(){
        return JSON.stringify(this.toArray());
    },

    /**
     * Get data object filtering/normalizing.
     * @public
     *
     * @return {Object}
     */
    toArray: function(){
        return this.getData(null, true, true);
    },

    /**
     * Set _id.
     * @public
     *
     * @param {String|Number|Couch.Uuid} id
     * @return {void}
     */
    setId: function(id){
        if (!isInstanceOf(id, Uuid)) {
            id = new Uuid(id);
        }

        this._id = id;
    },

    /**
     * Set _rev.
     * @public
     *
     * @param {String} rev
     */
    setRev: function(rev){
        this._rev = rev;
    },

    /**
     * Set _deleted.
     * @public
     *
     * @param {Boolean} deleted
     */
    setDeleted: function(deleted){
        this._deleted = !!deleted;
    },

    /**
     * Set an attachment.
     * @public
     *
     * @param  {Object|Couch.DocumentAttachment} attachment
     * @return {void}
     * @throws {Error}
     */
    setAttachment: function(attachment){
        attachment = attachment || {};
        // classify attachments
        if (!isInstanceOf(attachment, DocumentAttachment)) {
            if (!attachment.file) {
                throw new Error("Attachment file is required!");
            }

            var file = attachment.file;
            var fileName = attachment.file_name;
            attachment = new DocumentAttachment(this, file, fileName);
        }

        // check duplicated attachments
        if (this.data._attachments[attachment.fileName]) {
            throw new Exception("Attachment is alredy exists on this document!");
        }

        this._attachments[attachment.fileName] =
            this.data._attachments[attachment.fileName] = attachment;
    },

    /**
     * Set data.
     * @public
     *
     * @param  {Object} data
     * @return {void}
     */
    setData: function(data){
        if (data._id)      this.setId(data._id);
        if (data._rev)     this.setRev(data._rev);
        if (data._deleted) this.setRev(data._deleted);

        // handle attachments
        if (data._attachments && data._attachments.length) {
            data._attachments.forEach(function(attachment){
                this.setAttachment(attachment);
            });
            delete data._attachments;
        }

        for (var i in data) {
            this.data[i] = data[i];
        }
    },

    /**
     * Get data.
     * @public
     *
     * @param  {String}  key
     * @param  {Boolean} filter
     * @param  {Boolean} normalize
     * @return {mixed}
     */
    getData: function(key, filter, normalize){
        var data = (key != null) ? this.data[key] : this.data;

        if (filter) {
            // remove undefined fields
            for (var i in data) {
                if (data[i] === undefined) {
                    delete data[i];
                }
            }
            // remove default _deleted
            if (data._deleted === false) {
                delete data._deleted;
            }
        }

        if (normalize) {
            // handle id
            if (isInstanceOf(data._id, Uuid)) {
                data._id = data._id.toString();
            }
            // handle attachments
            if (data._attachments) {
                var isEmpty = true;
                for (var i in data._attachments) {
                    isEmpty = false;
                    if (isInstanceOf(data._attachments[i], DocumentAttachment)) {
                        data._attachments[i] = data._attachments[i].toArray();
                    } else {
                        data._attachments[i] = data._attachments[i];
                    }
                }
                if (isEmpty) delete data._attachments;
            }
        }

        return data;
    },

    /**
     * Ping document.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    ping: function(callback){
        if (!this._id) {
            throw new Error("_id field could not be empty!");
        }

        var headers = {};
        if (this._rev) {
            headers["If-None-Match"] = Util.format('"%s"', this._rev);
        }

        this.database.client.head(this.database.name +"/"+ this._id,
            {headers: headers}, callback);
    },

    /**
     * Find document.
     * @public @async
     *
     * @param  {Object}   query
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    find: function(query, callback){
        if (!this._id) {
            throw new Error("_id field could not be empty!");
        }

        query = query || {};
        if (this._rev && !query.rev) {
            query.rev = this._rev;
        }

        this.database.client.get(this.database.name +"/"+ this._id,
            {uriParams: query}, callback);
    },

    /**
     * Find document revisions.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    findRevisions: function(callback){
        this.find({revs: true}, function(stream, data){
            callback(stream, (data._revisions ? data._revisions : null));
        });
    },

    /**
     * Find document revisions (extended).
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    findRevisionsExtended: function(callback){
        this.find({revs_info: true}, function(stream, data){
            callback(stream, (data._revs_info ? data._revs_info : null));
        });
    },

    /**
     * Find attachments.
     * @public @async
     *
     * @param  {Boolean}  attEncInfo
     * @param  {Array}    attsSince
     * @param  {Function} callback
     * @return {void}
     */
    findAttachments: function(attEncInfo, attsSince, callback){
        var query = {};
        query.attachments = true;
        query.att_encoding_info = attEncInfo || false;

        if (attsSince && attsSince.length) {
            var attsSinceArray = [];
            attsSince.forEach(function(attsSince){
                attsSinceArray.push(Util.format('"%s"', Util.quote(attsSince)));
            });
            query.atts_since = Util.format("[%s]", attsSinceArray.join(","));
        }

        this.find(query, function(stream, data){
            callback(stream, (data._attachments ? data._attachments : null));
        })
    },

    /**
     * Save document.
     * @public @async
     *
     * @param  {Boolean}  batch
     * @param  {Boolean}  fullCommit
     * @param  {Function} callback
     * @return {void}
     */
    save: function(batch, fullCommit, callback){
        // prepare batch query
        batch = batch ? "?batch=ok" : "";

        // prepare headers
        var headers = {};
        headers["Content-Type"] = "application/json";
        if (fullCommit) {
            headers["X-Couch-Full-Commit"] = "true";
        }

        // update?
        if (this._rev) {
            headers["If-Match"] = this._rev;
        }

        // get data with "filter & normalize" options
        var data = this.getData(null, true, true);

        var $this = this;
        if (this._id == null) {
            // insert action
            this.database.client.post(this.database.name + batch,
                {body: data, headers: headers}, function(stream, data){
                    if (data.id != null) {
                        $this.setId(data.id);
                    }
                    if (data.rev != null) {
                        $this.setId(data.rev);
                    }
                    callback(stream, data);
            });
        } else {
            // update action
            this.database.client.put(this.database.name +"/"+ this._id + batch,
                {body: data, headers: headers}, function(stream, data){
                    if (data.rev != null) {
                        $this.setId(data.rev);
                    }
                    callback(stream, data);
            });
        }
    },

    /**
     * Remove document.
     * @public @async
     *
     * @param  {Boolean}  batch
     * @param  {Boolean}  fullCommit
     * @param  {Function} callback
     * @return {void}
     */
    remove: function(batch, fullCommit, callback) {
        // check required fields
        if (!this._id || !this._rev) {
            throw new Error("Both _id & _rev fields could not be empty!");
        }

        // prepare batch query
        batch = batch ? "?batch=ok" : "";

        // prepare headers
        var headers = {}
        headers["If-Match"] = this._rev;
        if (fullCommit) {
            headers["X-Couch-Full-Commit"] = "true";
        }

        this.database.client.delete(this.database.name +"/"+ this._id + batch,
            {headers: headers}, callback);
    },

    /**
     * Copy (this) document to destination.
     * @public @async
     *
     * @param  {String}   dest
     * @param  {Boolean}  batch
     * @param  {Boolean}  fullCommit
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    copy: function(dest, batch, fullCommit, callback) {
        // check id
        if (!this._id) {
            throw new Error("_id field could not be empty!");
        }

        // check destination
        if (!dest) {
            throw new Error("Destination could not be empty!");
        }

        // prepare batch query
        batch = batch ? "?batch=ok" : "";

        // prepare headers
        var headers = {};
        headers["Destination"] = dest;
        if (fullCommit) {
            headers["X-Couch-Full-Commit"] = "true";
        }

        this.database.client.copy(this.database.name +"/"+ this._id + batch,
            {headers: headers}, callback);
    },

    /**
     * Copy a (this) document to destination with specific revision.
     * @public @async
     *
     * @param  {String}   dest
     * @param  {Boolean}  batch
     * @param  {Boolean}  fullCommit
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    copyFrom: function(dest, batch, fullCommit, callback) {
        // check id & rev
        if (!this._id || !this._rev) {
            throw new Error("Both _id & _rev fields could not be empty!");
        }

        // check destination
        if (!dest) {
            throw new Error("Destination could not be empty!");
        }

        // prepare batch query
        batch = batch ? "?batch=ok" : "";

        // prepare headers
        var headers = {};
        headers["If-Match"] = this._rev;
        headers["Destination"] = dest;
        if (fullCommit) {
            headers["X-Couch-Full-Commit"] = "true";
        }

        this.database.client.copy(this.database.name +"/"+ this._id + batch,
            {headers: headers}, callback);
    },

    /**
     * Copy (this) document to existing document.
     * @public @async
     *
     * @param  {String}   dest
     * @param  {String}   destRev
     * @param  {Boolean}  batch
     * @param  {Boolean}  fullCommit
     * @param  {Function} callback
     * @return {void}
     * @throws {Error}
     */
    copyTo: function(dest, destRev, batch, fullCommit, callback) {
        // check id & rev
        if (!this._id || !this._rev) {
            throw new Error("Both _id & _rev fields could not be empty!");
        }

        // check destination
        if (!dest || !destRev) {
            throw new Error("Destination & destination revision could not be empty!");
        }

        // prepare batch query
        batch = batch ? "?batch=ok" : "";

        // prepare headers
        var headers = {};
        headers["If-Match"] = this._rev;
        headers["Destination"] = Util.format("%s?rev=%s", dest, destRev);
        if (fullCommit) {
            headers["X-Couch-Full-Commit"] = "true";
        }

        this.database.client.copy(this.database.name +"/"+ this._id + batch,
            {headers: headers}, callback);
    }
});

module.exports = Document;
