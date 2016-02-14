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
 * Couch object.
 * @type {Object}
 */
var Couch = {};
Couch.NAME = "Couch";
Couch.VERSION = "1.0.6";

/**
 * Couch.Couch object.
 * @public
 *
 * @module Couch
 * @object Couch.Couch
 * @author Kerem Güneş <k-gun@mail.com>
 */
Couch.Couch = function(config){
   this.setConfig(config);
};

/**
 * Couch.Couch prototype.
 * @type {Object}
 */
Couch.Couch.prototype = {
   /**
    * Config.
    * @type {Object}
    */
   config: {},

   /**
    * Set config.
    * @public
    *
    * @param {Object} config
    */
   setConfig: function(config){
      if (config) {
         for (var i in config) {
            this.config[i] = config[i];
         }
      }
   },

   /**
    * Get config.
    * @public
    *
    * @return {Object}
    */
   getConfig: function(){
      return this.config;
   }
};

/**
 * Add Couch to global scope.
 */
global.Couch = Couch;

/**
 * Global isVoid() function.
 * @public
 *
 * @param  {mixed} input
 * @return {Boolean}
 */
global.isVoid = function(input){
   return (input == null);
};

/**
 * Glboal isInstanceOf() function.
 * @public
 *
 * @param  {Object}  a
 * @param  {Object}  b
 * @return {Boolean}
 */
global.isInstanceOf = function(a, b){
   try {
      return (a instanceof b);
   } catch (e) {
      return (a instanceof b.constructor);
   }
};

/**
 * Append Couch modules into Couch object.
 */
var modules = {
   "Util"               : "./util/util",
   "Class"              : "./util/class",
   "Stream"             : "./http/stream",
   "Request"            : "./http/request",
   "Response"           : "./http/response",
   "Client"             : "./client",
   "Server"             : "./server",
   "Database"           : "./database",
   "Document"           : "./document",
   "DocumentAttachment" : "./document_attachment",
   "DocumentDesign"     : "./document_design",
   "Query"              : "./query",
   "Uuid"               : "./uuid"
}, i;
for (i in modules) {
   Couch[i] = require(modules[i]);
}

/**
 * Expose module.
 */
module.exports = Couch;
