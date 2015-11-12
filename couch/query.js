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
        if (!isNone(data)) {
            this.data = data;
        }
    },

    set: function(key, value) {
        this.data[key.toLowerCase()] = value;
    },
    get: function(key){
        return this.data[key];
    },
    toArray: function(){
        return this.data;
    },
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
            if (value === true || value === false) {
                data[key] = value ? "true" : "false";
            }
            data.push(encodeURIComponent(key) +"="+ encodeURIComponent(value));
        }

        return (this.dataString = data.join("&").replace(/%5B/gi, "[").replace(/%5D/gi, "]"));
    },
    skip: function(num){
        this.data.skip = num;
        return this;
    },
    limit: function(num){
        this.data.limit = num;
        return this;
    }
});

Query.parse = function(query, returnQueryObject){
    var pars = query.trim().replace(/&+/g, "&").split('&'),
        par, key, value, re = /^([\w]+)\[(.*)\]/i, ra, ks, ki, i = 0,
        params = {};
    while ((par = pars.shift()) && (par = par.split('=', 2))) {
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
    return !returnQueryObject ? params : new Query(params);
};

module.exports = Query;
