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
var Class = require("../util/class"),
    Stream = require("./stream"),
    Util = require("../util/util"),
    Query = require("../query");
var http = require("http");

/**
 * Request object.
 * @public
 *
 * @module  Couch
 * @object  Couch.Request
 * @extends Couch.Stream
 * @author  Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Request = Class.create("Request", {
    /**
     * Client object.
     * @type {Couch.Client}
     */
    client: null,

    /**
     * Request method.
     * @type {string}
     */
    method: undefined,

    /**
     * Request URI.
     * @type {string}
     */
    uri: undefined,

    /**
     * Object constructor.
     * @private
     *
     * @param {Couch.Client} client
     */
    __init__: function(client){
        // used in Couch.Stream.toString
        this.type = Stream.TYPE.REQUEST;
        this.httpVersion = "1.1";

        this.client = client;

        // set basic authorization header
        if (this.client.username && this.client.password) {
            this.headers["Authorization"] = "Basic "+
                Util.Base64.encode(this.client.username +":"+ this.client.password);
        }

        // set default headers
        this.headers["Host"] = Util.format("%s:%s", this.client.host, this.client.port);
        this.headers["Connection"] = "close";
        this.headers["Accept"] = "application/json";
        this.headers["Content-Type"] = "application/json";
        this.headers["User-Agent"] = Util.format(
            "%s/v%s (+http://github.com/qeremy/couch-js)", Couch.NAME, Couch.VERSION);
    },

    /**
     * Send request.
     * @public @async
     *
     * @param  {Function} callback
     * @return {void}
     */
    send: function(callback){
        if (callback && callback.call) {
            // request options
            var options = {
                  host: this.client.host,
                  port: this.client.port,
                method: this.client.Request.method,
                  path: this.client.Request.uri,
               headers: this.client.Request.headers
            }, $this = this;

            // create http.request
            var request = http.request(options, function(response){
                // set encoding
                response.setEncoding("utf8");

                // use raw headers
                var headers = request._header.trim().split("\r\n");
                headers.shift();
                headers.forEach(function(header){
                    var tmp = header.split(":");
                    if (tmp.length == 2) {
                        // set Client.Request headers
                        $this.client.Request.setHeader(tmp.shift(), tmp.join(":").trim());
                    }
                });

                var key, value;
                // use parsed headers
                for (key in response.headers) {
                    value = !isNone(response.headers[key])
                        ? response.headers[key].trim() : null;

                    // foo-bar => Foo-Bar
                    key = key.split("-").map(function(k){
                        return k.substr(0, 1).toUpperCase() + k.substr(1);
                    }).join("-");

                    // set Client.Response headers
                    $this.client.Response.setHeader(key, value);
                };

                // set Client.Response.statusCode
                $this.client.Response.setStatusCode(response.statusCode);
                // set Client.Response.statusText (auto-detected by statusCode)
                $this.client.Response.setStatusText(response.statusCode);

                // handle data (also if chunked)
                var body = "";
                response.on("data", function(data){
                    body += data;
                });

                // handle end
                response.on("end", function(){
                    // set Client.Response.body
                    $this.client.Response.setBody(body,
                        // is json?
                        $this.client.Response.getHeader("Content-Type") == "application/json");

                    // success -> callback (stream, data)
                    callback({
                        error: null,
                        request: $this.client.Request,
                        response: $this.client.Response
                    }, $this.client.Response.getData());
                });
            }).on("error", function(error) {
                // error -> callback (stream, data)
                callback({
                    error: error,
                    request: $this.client.Request,
                    response: $this.client.Response
                }, $this.client.Response.getData());
            });

            // set Client.Request.body if provided
            var body = $this.client.Request.getBody();
            if (!isNone(body)) {
                request.write(body);
            }

            // end request
            request.end();
        }
    },

    /**
     * Set request method.
     * @public
     *
     * @param  {string} method
     * @return {self}
     */
    setMethod: function(method) {
        this.method = method.toUpperCase();
        if (this.method != Request.METHOD.HEAD &&
            this.method != Request.METHOD.GET &&
            this.method != Request.METHOD.POST) {
            this.setHeader("X-HTTP-Method-Override", this.method);
        }

        return this;
    },

    /**
     * Set request URI.
     * @public
     *
     * @param  {string} uri
     * @param  {object} uriParams
     * @return {self}
     */
    setUri: function(uri, uriParams) {
        this.uri = uri;
        if (uriParams) {
            var query = (new Query(uriParams)).toString();
            if (query.length) {
                this.uri += "?"+ query.toString();
            }
        }

        return this;
    }
});

/**
 * Extend Request width a fresh Stream object.
 */
Class.extend(Request, new Stream());

/**
 * Re-define setBody() method.
 */
Class.extend(Request, {
    /**
     * Set request body.
     * @public
     *
     * @param  {object|string} body
     * @return {self}
     */
    setBody: function(body){
        if (body != null &&
            // these methods do not take request body
            this.method != Request.METHOD.HEAD &&
            this.method != Request.METHOD.GET
        ) {
            // if content type json (generally)
            if (this.headers["Content-Type"] == "application/json") {
                this.body = JSON.stringify(body);
            } else {
                this.body = body;
            }

            // add content length
            this.headers["Content-Length"] = this.body.length;
        }

        return this;
    }
});

/**
 * Add supported methods by CouchDB.
 * @type {Object}
 */
Request.METHOD = {
    HEAD: "HEAD",
     GET: "GET",
    POST: "POST",
     PUT: "PUT",
  DELETE: "DELETE",
    COPY: "COPY"
};

/**
 * Expose module.
 */
module.exports = Request;
