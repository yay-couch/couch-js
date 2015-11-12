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
    Stream = require("./stream");

/**
 * Response object.
 * @public
 *
 * @module  Couch
 * @object  Couch.Response
 * @extends Couch.Stream
 * @author  Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Response = Class.create("Response", {
    /**
     * Status code.
     * @type {Number}
     */
    statusCode: 0,

    /**
     * Status text.
     * @type {String}
     */
    statusText: "",

    /**
     * Object constructor.
     * @private
     */
    __init__: function(){
        // used in Couch.Stream.toString
        this.type = Stream.TYPE.RESPONSE;
        this.httpVersion = "1.1";
    },

    /**
     * Set status code.
     * @public
     *
     * @param  {Number} statusCode
     * @return {self}
     */
    setStatusCode: function(statusCode){
        this.statusCode = statusCode;

        return this;
    },

    /**
     * Get status code.
     * @public
     *
     * @return {Number}
     */
    getStatusCode: function(){
        return this.statusCode;
    },

    /**
     * Set status text.
     * @public
     *
     * @param  {String} statusCode
     * @return {self}
     */
    setStatusText: function(statusText){
        // auto-detect
        if (typeof statusText == "number"
                && statusText in Response.STATUS) {
            statusText = Response.STATUS[statusText];
        }
        this.statusText = statusText;

        return this;
    },

    /**
     * Get status text.
     * @public
     *
     * @return {String}
     */
    getStatusText: function(){
        return this.statusText;
    },

    /**
     * Check status code is?
     * @public
     *
     * @param  {Number}  statusCode
     * @return {Boolean}
     */
    isStatusCode: function(statusCode){
        return (this.statusCode === statusCode);
    }
});

/**
 * Extend Response width a fresh Stream object.
 */
Class.extend(Response, new Stream());

/**
 * Re-define setBody() method.
 */
Class.extend(Response, {
    /**
     * Set response body.
     * @public
     *
     * @param  {String}  body
     * @param  {Boolean} isJson
     * @return {self}
     */
    setBody: function(body, isJson){
        if (body != null) {
            this.body = (isJson !== false && body !== "")
                ? JSON.parse(body) : body;
        }

        return this;
    }
});

/**
 * Add supported statuses by CouchDB.
 * @type {Object}
 */
Response.STATUS = {
    200: "OK",
    201: "Created",
    202: "Accepted",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Resource Not Allowed",
    406: "Not Acceptable",
    409: "Conflict",
    412: "Precondition Failed",
    415: "Bad Content Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    500: "Internal Server Error"
};

/**
 * Expose module.
 */
module.exports = Response;
