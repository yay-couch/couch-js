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
 * Uuid object.
 * @public
 *
 * @module Couch
 * @object Couch.Uuid
 * @author Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Uuid = Class.create("Uuid", {
    /**
     * UUID value.
     * @type {String|Number}
     */
    value: undefined,

    /**
     * Object constructor.
     * @private
     *
     * @param {mixed} value
     */
    __init__: function(value){
        // true is trigger for self.generate() method
        if (value === true) {
            value = Uuid.generate();
        }

        this.setValue(value);
    },

    /**
     * Alias of self.getValue() method.
     *
     * @return {String|Number}
     */
    toString: function(){
        return this.getValue();
    },

    /**
     * Set value.
     *
     * @param  {String|Number} value
     * @return {void}
     */
    setValue: function(value){
        this.value = value;
    },

    /**
     * Get value.
     *
     * @return {String|Number}
     */
    getValue: function(){
        return this.value;
    }
});

/**
 * Generate UUID.
 *
 * @param  {Number} limit
 * @return {String|Number}
 * @throws {Error}
 */
Uuid.generate = function(limit){
    // simply unix timestamp
    if (limit === Uuid.TIMESTAMP) {
        return Math.round((+new Date) / 1000);
    }

    // set hex 32 as default
    limit = limit || Uuid.HEX_32;
    switch (limit) {
        case Uuid.HEX_8:
        case Uuid.HEX_32:
        case Uuid.HEX_40:
            break;
        default:
            throw new Error("Unimplemented limit given, only 0 or 8|32|40 available!");
    }

    // simply generate hexed value
    return (1 + Math.random()).toString(15).substring(2, 2 + limit);
};

/**
 * UUID limits.
 * @type {Number}
 */
Uuid.HEX_8 = 8;
Uuid.HEX_32 = 32;
Uuid.HEX_40 = 40;
Uuid.TIMESTAMP = 0;

/**
 * Expose module.
 */
module.exports = Uuid;
