var Class = require("./util/class"),
    Util = require("./util/util");

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
        if (document) {
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
        this.readFile();
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
            this.data = new Buffer(data).toString("base64");
        } else {
            this.data = data;
        }
        this.dataLength = this.data.length;
    }
});

module.exports = DocumentAttachment;
