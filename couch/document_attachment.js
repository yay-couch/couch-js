var Class = require("./util/class"),
    Util = require("./util/util"),
    Document = require("./document");

var fs = require("fs");
// var mimeDb = require('mime-db');

var DocumentAttachment = Class.create("DocumentAttachment", {
    document: null,
    file: undefined,
    fileName: undefined,
    data: null,
    dataLength: 0,
    contentType: undefined,
    digest: undefined,
    __init__: function(document, file, fileName){
        if (isInstanceOf(document, Document)) {
            this.document = document;
        }
        if (file) {
            this.file = file;
            if (fileName) {
                this.fileName = fileName;
            } else {
                this.fileName = file.substring(file.lastIndexOf("/") + 1);
            }
        }
    },
    ping: function(callback){
        if (!this.document) {
            throw new Error("Attachment document is not defined!");
        }
        if (!this.fileName) {
            throw new Error("Attachment file name is required!");
        }
        var docId = this.document._id;
        var docRev = this.document._rev;
        if (!docId) {
            throw new Error("Attachment document _id is required!");
        }
        var query = {}, headers = {};
        if (docRev) {
            query.rev = docRev;
        }
        if (this.digest) {
            headers["If-None-Match"] = Util.format('"%s"', this.digest);
        }
        return this.document.database.client.head(
            Util.format("%s/%s/%s", this.document.database.name, docId, encodeURIComponent(this.fileName)), {
                uriParams: query, headers: headers
            }, callback);
    },
    find: function(callback){
        if (!this.document) {
            throw new Error("Attachment document is not defined!");
        }
        if (!this.fileName) {
            throw new Error("Attachment file name is required!");
        }
        var docId = this.document._id;
        var docRev = this.document._rev;
        if (!docId) {
            throw new Error("Attachment document _id is required!");
        }
        var query = {}, headers = {};
        if (docRev) {
            query.rev = docRev;
        }
        headers["Accept"] = "*/*";
        headers["Content-Type"] = null;
        if (this.digest) {
            headers["If-None-Match"] = Util.format('"%s"', this.digest);
        }
        return this.document.database.client.get(
            Util.format("%s/%s/%s", this.document.database.name, docId, encodeURIComponent(this.fileName)), {
                uriParams: query, headers: headers
            }, callback);
    },
    toJson: function(){
        return JSON.stringify(this.toArray());
    },
    toArray: function(){
        this.readFile();
        return {
            data: this.data,
            content_type: this.contentType
        };
    },
    readFile: function(encode){
        if (!this.file) {
            throw new Error("Attachment file is empty!");
        }
        var info = Util.fileInfo(this.file);
        if (info) {
            this.contentType = info.mime;
        }
        var data = fs.readFileSync(this.file, "utf-8");
        if (encode !== false) {
            this.data = (new Buffer(data)).toString("base64");
        } else {
            this.data = data;
        }
        this.dataLength = this.data.length;
    }
});

module.exports = DocumentAttachment;
