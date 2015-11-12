var Class = require("./util/class"),
    Util = require("./util/util"),
    Uuid = require("./uuid"),
    Database = require("./database");

var Document = Class.create("Document", {
    _id: undefined,
    _rev: undefined,
    _deleted: false,
    _attachments: [],
    database: null,
    data: {},
    __init__: function(database, data){
        if (database) {
            this.database = database;
        }
        if (data) {
            this.setData(data);
        }
        var $this = this;
        ["_id", "_rev", "_deleted", "_attachments"].forEach(function(key){
            Object.defineProperty($this, key, {
                get: function(){
                    var value = $this.data[key];
                    if (key == "_id" && isInstanceOf(value, Uuid)) {
                        value = value.toString();
                    }
                    return value;
                },
                set: function(value){
                    if (key == "_id") {
                        value = new Uuid(value);
                    }
                    $this.data[key] = value;
                }
            });
        });
    },
    toJson: function(){
        var data = this.data;
        if (isInstanceOf(data._id, Uuid)) {
            data._id = data._id.toString();
        }
        return JSON.stringify(data);
    },
    setId: function(id){
        if (!isInstanceOf(id, Uuid)) {
            id = new Uuid(id);
        }
        this._id = id;
    },
    setRev: function(rev){
        this._rev = rev;
    },
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
