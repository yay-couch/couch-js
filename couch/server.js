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

/**
 * Module objects.
 * @private
 */
var Class = require("./util/class"),
    Client = require("./client");

/**
 * Server object.
 * @public
 *
 * @module Couch
 * @object Couch.Server
 * @author Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Server = Class.create("Server", {
    /**
     * Client object.
     * @type {Couch.Client}
     */
    client: null,
    __init__: function(client){
        if (!isInstanceOf(client, Client)) {
            throw new Error("Client must me instance of Couch.Client!");
        }
        this.client = client;
    },
    ping: function(callback){
        return this.client.head("/", null, callback);
    },
    info: function(key, callback) {
        return this.client.get("/", null, function(stream){
            return callback(stream, stream.response.getData(key));
        });
    },
    version: function(callback){
        return this.info("version", callback);
    },
    getActiveTasks: function(callback){
        return this.client.get("/_active_tasks", null, callback);
    },
    getAllDatabases: function(callback){
        return this.client.get("/_all_dbs", null, callback);
    },
    getDatabaseUpdates: function(query, callback){
        return this.client.get("/_db_updates", {uriParams: query}, callback);
    },
    getLogs: function(query, callback){
        return this.client.get("/_log", {uriParams: query}, callback);
    },
    replicate: function(query, callback) {
        query = query || {};
        if (!query.source || !query.target) {
            throw new Error("Both source & target required!");
        }
        return this.client.post("/_replicate", {body: query}, callback);
    },
    restart: function(callback){
        return this.client.post("/_restart", null, callback);
    },
    getStats: function(path, callback){
        return this.client.get("/_stats/"+ (path || ""), null, callback);
    },
    getUuid: function(count, callback){
        count = count || 1;
        return this.client.get("/_uuids?count="+ count, null, function(stream){
            var data = stream.response.getData("uuids");
            if (data.length) {
                data = (count === 1) ? data[0] : data;
            }
            return callback(stream, data);
        })
    },
    getConfig: function(section, key, callback){
        var path = [section, key].filter(function(value){
            return !!value;
        }).join("/");
        return this.client.get("/_config/"+ path, null, callback);
    },
    setConfig: function(section, key, value, callback){
        if (!section || !key) {
            throw new Error("Both section & key required!");
        }
        var path = [section, key].join("/");
        return this.client.put("/_config/"+ path, {body: value}, function(stream, data){
            if (200 !== stream.response.getStatusCode()) {
                data = false;
            }
            return callback(stream, data);
        });
    },
    removeConfig: function(section, key, callback){
        if (!section || !key) {
            throw new Error("Both section & key required!");
        }
        var path = [section, key].join("/");
        return this.client.delete("/_config/"+ path, null, function(stream, data){
            if (200 !== stream.response.getStatusCode()) {
                data = false;
            }
            return callback(stream, data);
        });
    }
});

module.exports = Server;
