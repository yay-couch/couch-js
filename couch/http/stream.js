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
    Util = require("../util/util");

/**
 * Stream object.
 * @public
 *
 * @module Couch
 * @object Couch.Stream
 * @author Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Stream = Class.create("Stream", {
    /**
     * Stream type.
     * @type {Number}
     */
    type: undefined,

    /**
     * HTTP (protocol) version.
     * @type {String}
     */
    httpVersion: undefined,

    /**
     * Stream headers.
     * @type {Object}
     */
    headers: {},

    /**
     * Stream body.
     * @type {String}
     */
    body: null,

    /**
     * Object constructor.
     * @private
     *
     * @param  {Object} headers
     * @param  {String} body
     */
    __init__: function(headers, body){
        this.headers = headers || {};
        this.body    = body    || null;
    },

    /**
     * Get stream data.
     * @public
     *
     * @uses   Util.dig()
     * @param  {String} key
     * @return {mixed}
     */
    getData: function(key){
        if (isVoid(key)) {
            return this.body;
        }

        return Util.dig(key, this.body || {});
    },

    /**
     * Set stream body.
     * @public @abstract
     *
     * @param  {String} body
     * @return {self}
     * @throws {Error}
     */
    setBody: function(body){
        // force re-define abstract method
        if (this.__proto__.constructor.nameOrig == "Stream") {
            throw new Error("You should re-define [<OBJECT>].setBody(body) method!");
        }
    },

    /**
     * Get stream body.
     * @public
     *
     * @return {String|null}
     */
    getBody: function(){
        return this.body;
    },

    /**
     * Set stream header.
     * @public
     *
     * @param  {String}             key
     * @param  {String|Number|null} value
     * @return {self}
     */
    setHeader: function(key, value){
        // null means "remove" header
        if (value === null) {
            delete this.headers[key];
        } else {
            this.headers[key] = value;
        }

        return this;
    },

    /**
     * Get stream header.
     * @public
     *
     * @param  {String} key
     * @return {String|Number}
     */
    getHeader: function(key){
        return this.headers[key];
    },

    /**
     * Get stream headers.
     * @public
     *
     * @return {Object}
     */
    getHeaderAll: function(){
        return this.headers;
    },

    /**
     * Get stream as string (raw).
     * @public
     *
     * @return {String}
     */
    toString: function(){
        var string = "";
        // add first line checking stream type
        if (this.type == Stream.TYPE.REQUEST) {
            string = Util.format("%s %s HTTP/%s\r\n",
                this.method, this.uri, this.httpVersion);
        } else if (this.type == Stream.TYPE.RESPONSE) {
            string = Util.format("HTTP/%s %s %s\r\n",
                this.httpVersion, this.statusCode, this.statusText);
        }

        // add headers
        var key, value;
        for (key in this.headers) {
            value = this.headers[key];
            if (!isVoid(value)) {
                string += Util.format("%s: %s\r\n", key, value);
            }
        }

        // add headers/body separator
        string += "\r\n";

        // add body
        if (this.body != null) {
            string += (typeof this.body == "string")
                ? this.body : JSON.stringify(this.body);
        }

        return string;
    }
});

/**
 * Shortcut.
 * @public @static
 *
 * @param  {Object} headers
 * @param  {String} body
 * @return {Couch.Stream}
 */
Stream.init = function(headers, body){
    return new Stream(headers, body);
};

/**
 * Stream types.
 * @type {Object}
 */
Stream.TYPE = {
    REQUEST: 1,
    RESPONSE: 2
};

/**
 * Expose module.
 */
module.exports = Stream;
