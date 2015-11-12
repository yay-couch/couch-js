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
    Database = require("./database");

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
     * @type {Array}
     */
    _attachments: [],

    /**
     * Document database object.
     * @type {Couch.Database}
     */
    database: null,

    /**
     * Document data.
     * @type {Object}
     */
    data: {},

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
        ["_id", "_rev", "_deleted", "_attachments"].forEach(function(key){
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
        var data = this.data;
        // normalize _id
        if (isInstanceOf(data._id, Uuid)) {
            data._id = data._id.toString();
        }

        return JSON.stringify(data);
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
    setAttachment: function(attachment){
        //
    },
    setData: function(data){
        if (data._id) this.setId(data._id);
        if (data._rev) this.setRev(data._rev);
        if (data._deleted) this.setRev(data._deleted);
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
    getData: function(key){
        return (key != null) ? this.data[key] : this.data;
    },
    ping: function(callback){
        if (!this._id) {
            throw new Error("_id field could not be empty!");
        }
        var headers = {};
        if (this._rev) {
            headers["If-None-Match"] = Util.format('"%s"', this._rev);
        }
        return this.database.client.head(this.database.name +"/"+ this._id, {headers: headers}, callback);
    },
    find: function(query, callback){
        if (!this._id) {
            throw new Error("_id field could not be empty!");
        }
        query = query || {};
        if (this._rev && !query.rev) {
            query.rev = this._rev;
        }
        return this.database.client.get(this.database.name +"/"+ this._id, {uriParams: query}, callback);
    },
    findRevisions: function(callback){
        return this.find({revs: true}, function(stream, data){
            callback(stream, (data._revisions ? data._revisions : null));
        });
    },
    findRevisionsExtended: function(callback){
        return this.find({revs_info: true}, function(stream, data){
            callback(stream, (data._revs_info ? data._revs_info : null));
        });
    },
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
        return this.find(query, function(stream, data){
            return callback(stream, (data._attachments ? data._attachments : null));
        })
    }
});

module.exports = Document;
