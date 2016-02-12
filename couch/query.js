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
var Class = require("./util/class");

/**
 * Query object.
 * @public
 *
 * @module Couch
 * @object Couch.Query
 * @author Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Query = Class.create("Query", {
    /**
     * Query data.
     * @type {Object}
     */
    data: {},

    /**
     * Query string.
     * @type {String}
     */
    dataString: "",

    /**
     * Object constructor.
     * @private
     *
     * @param {Object} data
     */
    __init__: function(data){
        if (!isVoid(data)) {
            this.data = data;
        }
    },

    /**
     * Set data field.
     * @public
     *
     * @param  {String} key
     * @param  {mixed} value
     * @return {self}
     */
    set: function(key, value) {
        this.data[key.toLowerCase()] = value;

        return this;
    },

    /**
     * Get data field.
     * @public
     *
     * @param  {String} key
     * @return {mixed}
     */
    get: function(key){
        return this.data[key];
    },

    /**
     * Get data as array.
     * @public
     *
     * @return {Object}
     */
    toArray: function(){
        return this.data;
    },

    /**
     * Get data as query string.
     * @public
     *
     * @return {String}
     */
    toString: function(){
        if (this.dataString != "") {
            return this.dataString;
        }

        var data = [], key, value;
        for (key in this.data) {
            value = this.data[key];
            if (typeof value == "undefined") {
                continue;
            }

            // handle CouchDB booleans
            if (value === true || value === false) {
                value = value ? "true" : "false";
            }

            data.push(encodeURIComponent(key) +"="+ encodeURIComponent(value));
        }

        return (
            this.dataString = data.join("&")
                // fix brackets
                .replace(/%5B/gi, "[")
                .replace(/%5D/gi, "]")
        );
    },

    /**
     * Add skip param.
     * @public
     *
     * @param  {Number} num
     * @return {self}
     */
    skip: function(num){
        this.data.skip = num;

        return this;
    },

    /**
     * Add limit param.
     * @public
     *
     * @param  {Number} num
     * @return {self}
     */
    limit: function(num){
        this.data.limit = num;

        return this;
    }
});

/**
 * Simply query parser.
 * @public
 *
 * @param  {String}  query
 * @param  {Boolean} queryNew Return a new Query object?
 * @return {mixed}
 */
Query.parse = function(query, queryNew){
    var pars = query.trim().replace(/&+/g, "&").split("&"),
        par, key, value, re = /^([\w]+)\[(.*)\]/i, ra, ks, ki, i = 0,
        params = {};

    while ((par = pars.shift()) && (par = par.split("=", 2))) {
        key = decodeURIComponent(par[0]);

        // prevent param value going to be "undefined" as string
        value = decodeURIComponent(par[1] || "").replace(/\+/g, " ");

        // check array params
        if (ra = re.exec(key)) {
            ks = ra[1];

            // init array param
            if (!(ks in params)) {
                params[ks] = {};
            }

            // set int key
            ki = (ra[2] != "") ? ra[2] : i++;

            // set array param
            params[ks][ki] = value;

            // go on..
            continue;
        }

        // set param
        params[key] = value;
    }

    // return a new Query object
    if (queryNew) {
        return new Query(params);
    }

    return params;
};

/**
 * Expose module.
 */
module.exports = Query;
