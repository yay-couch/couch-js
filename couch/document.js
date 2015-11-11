var Class = require("./util/class"),
    Util = require("./util/util"),
    Uuid = require("./uuid"),
    Database = require("./database");

var Document = Class.create("Document", {
    _id: undefined,
    rev: undefined,
    deleted: false,
    attachments: [],
    database: null,
    data: {},
    __init__: function(database, data){
        if (database) {
            this.database = database;
        }
        if (data) {
            this.setData(data);
        }
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
        var headers = {};
        if (this._rev) {
            headers["If-None-Match"] = Util.format('"%s"', this._rev);
        }
        return this.database.client.head(this.database.name +"/"+ this._id, {headers: headers}, callback);
    },
    find: function(query, callback){
        query = query || {};
        if (!this._id) {
            throw new Error("_id field could not be empty!");
        }
        if (this._rev && !query.rev) {
            query.rev = this._rev;
        }
        return this.database.client.get(this.database.name +"/"+ this._id, {uriParams: query}, callback);
    }
});

module.exports = Document;
