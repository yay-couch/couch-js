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
var fs = require("fs");
var cp = require("child_process");

/**
 * Util object.
 * @public
 *
 * @module Couch
 * @object Couch.Util
 * @author Kerem Güneş <k-gun@mail.com>
 */
var Util = {
   /**
    * Extractor.
    * @public
    *
    * @link   http://stackoverflow.com/a/11864828/362780
    * @param  {Object} input
    * @param  {String} key
    * @return {mixed}
    */
   dig: function(input, key) {
      var keys = (""+ key).split("."), key = keys.shift();
      if (!keys.length) {
         return input[key];
      }

      return dig(input[key], keys.join("."));
   },

   /**
    * Simply mixin.
    * @public
    *
    * @param  {Object} target
    * @param  {Object} source
    * @return {Object}
    */
   extend: function(target, source) {
      for (var i in source) {
         target[i] = source[i];
      }

      return target;
   },

   /**
    * Simply format.
    * @public
    *
    * @return {String}
    */
   format: function(){
      var args = arguments,
         s = args[0], m, ms = s.match(/(%s)/g) || [], i = 1;

      while (m = ms.shift()) {
         s = s.replace(/(%s)/, args[i++]);
      }

      return s;
   },

   /**
    * Quote for CouchDB queries.
    * @public
    *
    * @param  {String} input
    * @return {String}
    */
   quote: function(input){
      return input.replace(/"/g, "%22");
   },

   /**
    * Sync'ed exec.
    * @public
    *
    * @link   http://uri.li/yKHV Original source.
    * @param  {String} cmd
    * @param  {Object} options Used only if built-in execSync() exists.
    * @return {String}
    */
   execSync: function(cmd, options) {
      // check built-in execSync() @kerem
      if (cp.execSync) {
         return cp.execSync(cmd, options || {});
      }

      // process files @kerem
      var outFile = "./__execsync.out.tmp",
         donFile = "./__execsync.don.tmp";

      // remove if these files exists @kerem
      try {
         fs.unlinkSync(outFile);
         fs.unlinkSync(donFile);
      } catch (e) {}

      // run the command in a subshell
      cp.exec(cmd +" 2>&1 1> '"+ outFile +"' && echo 'done!' > '"+ donFile +"'");

      // just block the event loop while command'ing
      while (!fs.existsSync(donFile)) {}

      // add utf-8 @kerem
      var output = fs.readFileSync(""+ outFile +"", "utf-8");

      // remove tmp files
      fs.unlinkSync(outFile);
      fs.unlinkSync(donFile);

      return output;
   },

   /**
    * Simply PHP->finfo hack.
    * @public
    *
    * @param  {String} file
    * @return {Object|void}
    * @throws {Error}
    * @example
    *   {mime: 'text/plain', charset: 'us-ascii', name: 'index.js' extension: 'js'}
    */
   fileInfo: function(file){
      // check file exists
      if (!this.fileExists(file)) {
         throw new Error("Given file does not exist! file: '"+ file +"'");
      }

      var mime, charset, name, extension, i;
      // detect name
      if ((i = file.lastIndexOf("/")) > 0) {
         name = file.substring(i + 1);
      } else {
         name = file;
      }
      // detect extension
      if ((i = file.lastIndexOf(".")) > 0) {
         extension = file.substring(i + 1);
      }

      // make a shell command
      var out = this.execSync("file -i '"+ file +"' | awk '{print $2} {print $3}'");
      if (out) {
         var tmp = tmp.trim().split("\n");
         if (tmp.length == 2) {
            // remove comma
            mime = (tmp[0].lastIndexOf(";") > -1)
               ? tmp[0].trim().substring(0, tmp[0].length - 1) : tmp[0];
            // detect charset
            charset = tmp[1].trim().split("=")[1];
         }

         return {mime: mime, charset: charset, name: name, extension: extension};
      }
   },

   /**
    * Simply file checker.
    * @public
    *
    * @param  {String} file
    * @return {Boolean}
    */
   fileExists: function(file){
      try { fs.statSync(file); return true; }
         catch (e) { return false; }
   },

   /**
    * Base64 helper.
    * @public
    *
    * @type {Object}
    */
   Base64: {
      /**
       * Encoding.
       * @type {String}
       */
      encoding: "utf-8",

      /**
       * Encoder.
       * @public
       *
       * @param  {String} data
       * @return {String}
       */
      encode: function(data){
         return (new Buffer(data)).toString("base64");
      },

      /**
       * Decoder.
       * @public
       *
       * @param  {String} data
       * @param  {String} encoding
       * @return {String}
       */
      decode: function(data, encoding){
         return (new Buffer(data, "base64")).toString(encoding || this.encoding);
      }
   }
};

/**
 * Expose module.
 */
module.exports = Util;
