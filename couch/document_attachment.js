/**
 * Copyright 2015 Kerem Güneş
 *   <k-gun@mail.com>
 *
 * Apache License, Version 2.0
 *   <http://www.apache.org/licenses/LICENSE-2.0>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
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
var Class    = require("./util/class"),
    Util     = require("./util/util"),
    Document = require("./document");

/**
 * FS object.
 * @private
 */
var fs = require("fs");

/**
 * DocumentAttachment object.
 * @public
 *
 * @module Couch
 * @object Couch.DocumentAttachment
 * @author Kerem Güneş <k-gun@mail.com>
 */
var DocumentAttachment = Class.create("DocumentAttachment", {
   /**
    * Owner document.
    * @type {Couch.Document}
    */
   document: null,

   /**
    * Attachment file.
    * @type {String}
    */
   file: undefined,

   /**
    * Attachment file name.
    * @type {String}
    */
   fileName: undefined,

   /**
    * Attachment file contents.
    * @type {String}
    */
   data: null,

   /**
    * Attachment file contents length.
    * @type {Number}
    */
   dataLength: 0,

   /**
    * Attachment mime.
    * @type {String}
    */
   contentType: undefined,

   /**
    * CouchDB file digest.
    * @type {String}
    */
   digest: undefined,

   /**
    * Object constructor.
    * @private
    *
    * @param {Couch.Document} document
    * @param {String}       file
    * @param {String}       fileName
    */
   __init__: function(document, file, fileName){
      if (isInstanceOf(document, Document)) {
         this.document = document;
      }

      if (file) {
         this.file = file;
         if (fileName) {
            this.fileName = fileName;
         } else {
            // auto-detect
            this.fileName = file.substring(file.lastIndexOf("/") + 1);
         }
      }
   },

   /**
    * Ping attachment.
    * @public @async
    *
    * @param  {Function} callback
    * @return {void}
    * @throws {Error}
    */
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

      var query = {};
      if (docRev) {
         query.rev = docRev;
      }

      var headers = {};
      if (this.digest) {
         headers["If-None-Match"] = Util.format('"%s"', this.digest);
      }

      this.document.database.client.head(Util.format("%s/%s/%s",
         this.document.database.name, encodeURIComponent(docId), encodeURIComponent(this.fileName)), {
            uriParams: query, headers: headers
         }, callback);
   },

   /**
    * Find attachment.
    * @public @async
    *
    * @param  {Function} callback
    * @return {void}
    * @throws {Error}
    */
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

      var query = {};
      if (docRev) {
         query.rev = docRev;
      }

      var headers = {};
      headers["Accept"] = "*/*";
      headers["Content-Type"] = null; // remove
      if (this.digest) {
         headers["If-None-Match"] = Util.format('"%s"', this.digest);
      }

      this.document.database.client.get(Util.format("%s/%s/%s",
         this.document.database.name, encodeURIComponent(docId), encodeURIComponent(this.fileName)), {
            uriParams: query, headers: headers
         }, callback);
   },

   /**
    * Save attachment.
    * @public @async
    *
    * @param  {Function} callback
    * @return {void}
    * @throws {Error}
    */
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

      // read file and set data, set dataLength, set contentType
      this.readFile(false);

      var headers = {};
      headers["If-Match"] = docRev;
      headers["Content-Type"] = this.contentType;

      this.document.database.client.put(Util.format("%s/%s/%s",
         this.document.database.name, encodeURIComponent(docId), encodeURIComponent(this.fileName)), {
            body: this.data, headers: headers
         }, callback);
   },

   /**
    * Remove attachment.
    * @public @async
    *
    * @param  {Boolean}  batch
    * @param  {Boolean}  fullCommit
    * @param  {Function} callback
    * @return {void}
    * @throws {Error}
    */
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

      this.document.database.client.delete(Util.format("%s/%s/%s%s",
         this.document.database.name, encodeURIComponent(docId), encodeURIComponent(this.fileName), batch), {
            headers: headers
         }, callback);
   },

   /**
    * Get attachment as JSON string.
    * @public
    *
    * @return {String}
    */
   toJson: function(){
      return JSON.stringify(this.toArray());
   },

   /**
    * Get attachment as CouchDB expects.
    * @public
    *
    * @return {Object}
    */
   toArray: function(){
      // read file
      this.readFile();

      return {
         data: this.data,
         content_type: this.contentType
      };
   },

   /**
    * Read attachment file, set data/dataLength/contentType
    * @public
    *
    * @param  {Boolean} encode
    * @return {void}
    * @throws {Error}
    */
   readFile: function(encode){
      if (!this.file) {
         throw new Error("Attachment file is empty!");
      }

      // i loved this! :)
      var info = Util.fileInfo(this.file);
      if (info) {
         this.contentType = info.mime;
      }

      // read file contents
      var data = fs.readFileSync(this.file, "utf-8");

      // default to Base64
      if (encode !== false) {
         this.data = Util.Base64.encode(data);
      } else {
         this.data = data;
      }

      // set data length
      this.dataLength = this.data.length;
   }
});

/**
 * Expose module.
 */
module.exports = DocumentAttachment;
