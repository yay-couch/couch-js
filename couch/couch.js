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
 * Couch object.
 * @type {Object}
 */
var Couch = {};
Couch.NAME = "Couch";
Couch.VERSION = "1.0";

/**
 * Couch.Couch object.
 * @public
 *
 * @module Couch
 * @object Couch.Couch
 * @author Kerem Güneş <qeremy[at]gmail[dot]com>
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
 * Global isNone() function.
 * @public
 *
 * @param  {mixed} input
 * @return {Boolean}
 */
global.isNone = function(input){
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
    return (a instanceof b);
};

/**
 * Append Couch modules into Couch object.
 * @type {[type]}
 */
Couch.Util = require("./util/util");
Couch.Query = require("./query");
Couch.Client = require("./client");
Couch.Server = require("./server");
Couch.Database = require("./database");
Couch.Document = require("./document");
Couch.DocumentAttachment = require("./document_attachment");
Couch.DocumentDesign = require("./document_design");
Couch.Uuid = require("./uuid");

/**
 * Expose module.
 */
module.exports = Couch;
