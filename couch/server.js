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
var Class  = require("./util/class"),
    Client = require("./client");

/**
 * Server object.
 * @public
 *
 * @module Couch
 * @object Couch.Server
 * @author Kerem Güneş <k-gun@mail.com>
 */
var Server = Class.create("Server", {
   /**
    * Client object.
    * @type {Couch.Client}
    */
   client: null,

   /**
    * Object constructor.
    * @private
    *
    * @param  {Couch.Client} client
    * @throws {Error}
    */
   __init__: function(client){
      if (!isInstanceOf(client, Client)) {
         throw new Error("Client must me instance of Couch.Client!");
      }

      this.client = client;
   },

   /**
    * Ping server.
    * @public @async
    *
    * @param  {Function} callback
    * @return {void}
    */
   ping: function(callback){
      this.client.head("/", null, callback);
   },

   /**
    * Get server info.
    * @public @async
    *
    * @param  {String}   key
    * @param  {Function} callback
    * @return {void}
    */
   info: function(key, callback) {
      this.client.get("/", null, function(stream){
         callback(stream, stream.response.getData(key));
      });
   },

   /**
    * Get server version.
    * @public @async
    *
    * @param  {Function} callback
    * @return {void}
    */
   version: function(callback){
      this.info("version", callback);
   },

   /**
    * Get active tasks.
    * @public @async
    *
    * @param  {Function} callback
    * @return {void}
    */
   getActiveTasks: function(callback){
      this.client.get("/_active_tasks", null, callback);
   },

   /**
    * Get databases.
    * @public @async
    *
    * @param  {Function} callback
    * @return {void}
    */
   getAllDatabases: function(callback){
      this.client.get("/_all_dbs", null, callback);
   },

   /**
    * Get database updates.
    * @public @async
    *
    * @param  {Object}   query
    * @param  {Function} callback
    * @return {void}
    */
   getDatabaseUpdates: function(query, callback){
      this.client.get("/_db_updates", {uriParams: query}, callback);
   },

   /**
    * Get database logs.
    * @public @async
    *
    * @param  {Object}   query
    * @param  {Function} callback
    * @return {void}
    */
   getLogs: function(query, callback){
      this.client.get("/_log", {uriParams: query}, callback);
   },

   /**
    * Get database stats.
    * @public @async
    *
    * @param  {String}   path
    * @param  {Function} callback
    * @return {void}
    */
   getStats: function(path, callback){
      this.client.get("/_stats/"+ (path || ""), null, callback);
   },

   /**
    * Get a new uuid.
    * @public @async
    *
    * @param  {Function} callback
    * @return {void}
    */
   getUuid: function(count, callback){
      this.getUuid(1, function(stream, data){
         callback(stream, data[0])
      });
   },

   /**
    * Get new uuid(s).
    * @public @async
    *
    * @param  {Number}   count
    * @param  {Function} callback
    * @return {void}
    */
   getUuid: function(count, callback){
      this.client.get("/_uuids?count="+ (count || 1), null, function(stream){
         var data = stream.response.getData("uuids");
         callback(stream, data);
      });
   },

   /**
    * Replicate database.
    * @public @async
    *
    * @param  {Object}   query
    * @param  {Function} callback
    * @return {void}
    * @throws {Error}
    */
   replicate: function(query, callback) {
      query = query || {};
      if (!query.source || !query.target) {
         throw new Error("Both source & target required!");
      }

      this.client.post("/_replicate", {body: query}, callback);
   },

   /**
    * Restart database.
    * @public @async
    *
    * @param  {Function} callback
    * @return {void}
    */
   restart: function(callback){
      this.client.post("/_restart", null, callback);
   },

   /**
    * Get database config.
    * @public @async
    *
    * @param  {String}   section
    * @param  {String}   key
    * @param  {Function} callback
    * @return {void}
    */
   getConfig: function(section, key, callback){
      var path = "";

      // prepare path
      if (section || key) {
         path = [section, key].filter(function(value){
            return !!value;
         }).join("/");
      }

      this.client.get("/_config/"+ path, null, callback);
   },

   /**
    * Set database config.
    * @public @async
    *
    * @param  {String}   section
    * @param  {String}   key
    * @param  {String}   value
    * @param  {Function} callback
    * @return {void}
    * @throws {Error}
    */
   setConfig: function(section, key, value, callback){
      if (!section || !key) {
         throw new Error("Both section & key required!");
      }

      // prepare path
      var path = [section, key].join("/");

      this.client.put("/_config/"+ path, {body: value}, function(stream, data){
         // modify data as "false" if fails
         if (200 !== stream.response.getStatusCode()) {
            data = false;
         }

         callback(stream, data);
      });
   },

   /**
    * Remove database config.
    * @public @async
    *
    * @param  {String}   section
    * @param  {String}   key
    * @param  {Function} callback
    * @return {void}
    */
   removeConfig: function(section, key, callback){
      if (!section || !key) {
         throw new Error("Both section & key required!");
      }

      // prepare path
      var path = [section, key].join("/");

      this.client.delete("/_config/"+ path, null, function(stream, data){
         // modify data as "false" if fails
         if (200 !== stream.response.getStatusCode()) {
            data = false;
         }

         callback(stream, data);
      });
   }
});

/**
 * Expose module.
 */
module.exports = Server;
