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

/**
 * HTTP object.
 * @private
 */
var http = require("http");

/**
 * @class   Couch.Request
 * @extends Couch.Stream
 * @public
 */
var Request = Class.create("Request", {
    /**
     * Client object
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
     * @param {Couch.Client} client
     * @constructor
     */
    __init__: function(client){
        // used in Stream.toString
        this.type = Stream.TYPE.REQUEST;
        this.httpVersion = "1.1";

        this.client = client;

        // set basic authorization header
        if (this.client.username && this.client.password) {
            this.headers["Authorization"] = "Basic "+
                (new Buffer(this.client.username +":"+ this.client.password)).toString("base64");
        }

        // set default headers
        this.headers["Host"] = Util.format("%s:%s", this.client.host, this.client.port);
        this.headers["Connection"] = "close";
        this.headers["Accept"] = "application/json";
        this.headers["Content-Type"] = "application/json";
        this.headers["User-Agent"] = Util.format(
            "%s/v%s (+http://github.com/qeremy/couch-js)", Couch.NAME, Couch.VERSION);
    },

    send: function(callback){
        if (callback && callback.call) {
            var options = {
                  host: this.client.host,
                  port: this.client.port,
                method: this.client.Request.method,
                  path: this.client.Request.uri,
               headers: this.client.Request.headers
            }, $this = this;

            var request = http.request(options, function(response){
                response.setEncoding("utf8");
                var headers = request._header.trim().split("\r\n");
                headers.shift();
                headers.forEach(function(header){
                    var tmp = header.split(":");
                    if (tmp.length == 2) {
                        $this.client.Request.setHeader(tmp.shift(), tmp.join(":").trim());
                    }
                });

                var key, value;
                for (key in response.headers) {
                    value = response.headers[key];
                    value = !isNone(value) ? value.trim() : null;
                    key = key.split("-").map(function(k){
                        return k.substr(0, 1).toUpperCase() + k.substr(1);
                    }).join("-");
                    $this.client.Response.setHeader(key, value);
                };

                $this.client.Response.setStatusCode(response.statusCode);
                $this.client.Response.setStatusText(response.statusCode);

                var body = "";
                response.on("data", function(data){
                    body += data;
                });

                response.on("end", function(){
                    $this.client.Response.setBody(body,
                        $this.client.Response.getHeader("Content-Type") == "application/json");

                    callback({
                        error: null,
                        request: $this.client.Request,
                        response: $this.client.Response
                    }, $this.client.Response.getData());
                });
            }).on("error", function(error) {
                callback({
                    error: error,
                    request: $this.client.Request,
                    response: $this.client.Response
                }, $this.client.Response.getData());
            });

            var body = $this.client.Request.getBody();
            if (!isNone(body)) {
                request.write(body);
            }

            request.end();
        }
    },
    setMethod: function(method) {
        this.method = method.toUpperCase();
        if (this.method != Request.METHOD.HEAD &&
            this.method != Request.METHOD.GET &&
            this.method != Request.METHOD.POST) {
            this.setHeader("X-HTTP-Method-Override", this.method);
        }
        return this;
    },
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
Class.extend(Request, Stream.init({}, null));

/**
 * Re-define setBody() method.
 */
Class.extend(Request, {
    /**
     * Set request body.
     *
     * @param  {object|string} body
     * @return {Request}
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
