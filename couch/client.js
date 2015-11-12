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
    Util = require("./util/util");
var Request = require("./http/request"),
    Response = require("./http/response");

/**
 * Client object.
 * @public
 *
 * @module Couch
 * @object Couch.Client
 * @author Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Client = Class.create("Client", {
    /**
     * Couch object
     * @type {Couch.Couch}
     */
    couch: null,

    /**
     * CouchDB host.
     * @type {String}
     */
    host: "localhost",

    /**
     * CouchDB port.
     * @type {Number}
     */
    port: 5984,

    /**
     * CouchDB username.
     * @type {String}
     */
    username: null,

    /**
     * CouchDB password.
     * @type {String}
     */
    password: null,

    /**
     * Request object.
     * @type {Couch.Request}
     */
    Request: null,

    /**
     * Response object.
     * @type {Couch.Response}
     */
    Response: null,

    /**
     * Object constructor.
     * @private
     *
     * @param  {Couch.Couch}
     */
    __init__: function(couch){
        this.couch = couch;

        // get Couch config
        var config = this.couch.getConfig();

        // set Client props if in config
        if ("host" in config) this.host = config.host;
        if ("port" in config) this.port = config.port;

        if ("username" in config) this.username = config.username;
        if ("password" in config) this.password = config.password;
    },

    /**
     * Get request object.
     * @return {Couch.Request}
     */
    getRequest: function(){
        return this.Request;
    },

    /**
     * Get resonse object.
     * @return {Couch.Response}
     */
    getResponse: function(){
        return this.Response;
    },

    /**
     * Perform a request.
     *
     * @return {Couch.Request}
     * @throws {Error}
     */
    request: function(uri, options){
        options = options || {};

        var uriType = typeof uri;

        // notation: GET /foo
        if (uriType == "string") {
            var r = uri.trim().match(/^([a-z]+)\s+(.+)/i);
            if (!r || !(r.length == 3)) {
                throw new Error("Usage: <REQUEST METHOD> <REQUEST URI>!");
            }
            options.method = r[1],
            options.uri    = r[2].replace(/\/+/g, "/");
        }
        // notation: {method: "GET", uri: "/foo"}
        else if (uriType == "object") {
            Util.extend(options, uri);
        }

        // method & uri are required
        if (!options.method || !options.uri) {
            throw new Error("You should provide both method & uri!");
        }

        var $this = this;

        // init request/response objects
        $this.Request = new Request($this);
        $this.Response = new Response();

        // set request method & uri
        $this.Request
            .setMethod(options.method)
            .setUri(options.uri, options.uriParams);

        // set request headers
        if (options.headers) {
            for (var key in options.headers) {
                $this.Request.setHeader(key, options.headers[key]);
            }
        }

        // set request body
        $this.Request.setBody(options.body);

        // simply static method to call callback
        return {
            done: function(callback){
                $this.Request.send(callback);
            }
        };
    }
});

/**
 * Add shortcut methods into Client.prototype.
 * @public
 */
["head", "get", "post", "put", "copy", "delete"].forEach(function(method){
    Client.prototype[method] = function(uri, options, callback){
        return this.request(Request.METHOD[method.toUpperCase()]+" /"+ uri, options)
            .done(callback);
    };
});

/**
 * Expose module.
 */
module.exports = Client;
