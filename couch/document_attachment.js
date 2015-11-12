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

var Class = require("./util/class"),
    Util = require("./util/util"),
    Document = require("./document");

var fs = require("fs");

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
    save: function(callback){
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
        if (!docRev) {
            throw new Error("Attachment document _rev is required!");
        }
        this.readFile(false);
        var headers = {};
        headers["If-Match"] = docRev;
        headers["Content-Type"] = this.contentType;
        return this.document.database.client.put(
            Util.format("%s/%s/%s", this.document.database.name, docId, encodeURIComponent(this.fileName)), {
                body: this.data, headers: headers
            }, callback);
    },
    remove: function(batch, fullCommit, callback){
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
        if (!docRev) {
            throw new Error("Attachment document _rev is required!");
        }
        batch = batch ? "?batch=ok" : "";
        var headers = {};
        headers["If-Match"] = docRev;
        if (fullCommit) {
            headers["X-Couch-Full-Commit"] = "true";
        }
        return this.document.database.client.delete(
            Util.format("%s/%s/%s%s", this.document.database.name, docId, encodeURIComponent(this.fileName), batch), {
                headers: headers
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
            this.data = Util.Base64.encode(data);
        } else {
            this.data = data;
        }
        this.dataLength = this.data.length;
    }
});

module.exports = DocumentAttachment;
