var Class = require("./util/class"),
    Uuid = require("./uuid");

var Document = Class.create("Document", {
    id: undefined,
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
        if (!this.id instanceof Uuid) {
            id = new Uuid(id);
        }
        this.id = id;
    },
    setRev: function(rev){
        this.rev = rev;
    },
    setDeleted: function(deleted){
        this.deleted = !!deleted;
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
        return key ? this.data[key] : this.data;
    }
});

module.exports = Document;
