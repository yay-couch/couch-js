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
var fs = require("fs");
var cp = require("child_process");

/**
 * Util object.
 * @public
 *
 * @module Couch
 * @object Couch.Util
 * @author Kerem Güneş <qeremy[at]gmail[dot]com>
 */
var Util = {
    /**
     * Simply mixin.
     * @public
     *
     * @param  {Object} to
     * @param  {Object} from
     * @return {Object}
     */
    extend: function(to, from) {
        for (var i in from) {
            to[i] = from[i];
        }

        return to;
    },

    /**
     * Simply format.
     * @public
     *
     * @return {String}
     */
    format: function(){
        var args = arguments,
            s = args[0], m, ms = s.match(/(%s)/g) || [], i = 1;

        while (m = ms.shift()) {
            s = s.replace(/(%s)/, args[i++]);
        }

        return s;
    },

    /**
     * Quote for CouchDB queries.
     * @public
     *
     * @param  {String} input
     * @return {String}
     */
    quote: function(input){
        return input.replace(/"/g, "%22");
    },

    /**
     * Iterator.
     * @public
     *
     * @link   https://github.com/qeremy/so/blob/master/so.js#L92
     * @param  {Object|Array} input
     * @param  {Function}     fn
     * @param  {Object|none}  scope
     * @return {Object}
     */
    forEach: function(input, fn, scope){
        var len = input && input.length, i;
        // array iterator (value => index)
        if (typeof len !== "undefined") {
            for (i = 0; i < len; i++) {
                if (false === fn.call(scope || input[i], i, input[i], input)) {
                    break;
                }
            }
        }
        // object iterator (key => value)
        else {
            for (i in input) {
                if (false === fn.call(scope || input[i], i, input[i], input)) {
                    break;
                }
            }
        }
        return scope || input;
    },
    /**
     * Sync'ed exec.
     * @public
     *
     * @link   http://uri.li/yKHV
     * @param  {String} cmd
     * @param  {Object} options Used only if built-in execSync() exists.
     * @return {String}
     */
    execSync: function(cmd, options) {
        // check built-in execSync()
        if (cp.execSync) {
            return cp.execSync(cmd, options || {});
        }

        var outFile = "./__execsync.out.tmp",
            donFile = "./__execsync.don.tmp";

        // remove if these files exists
        try {
            fs.unlinkSync(outFile);
            fs.unlinkSync(donFile);
        } catch (e) {}

        // run the command in a subshell
        cp.exec(cmd +" 2>&1 1> '"+ outFile +"' && echo 'done!' > '"+ donFile +"'");

        // just block the event loop while command'ing
        while (!fs.existsSync(donFile)) {}

        // add utf-8 @kerem
        var output = fs.readFileSync(""+ outFile +"", "utf-8");

        // remove tmp files
        fs.unlinkSync(outFile);
        fs.unlinkSync(donFile);

        return output;
    },

    /**
     * Simply PHP->finfo hack.
     * @public
     *
     * @param  {String} file
     * @return {Object|undefined}  Eg: {mime: 'text/plain', charset: 'us-ascii', extension: 'js'}
     * @throws {Error}
     */
    fileInfo: function(file){
        // check file exists
        if (!this.fileExists(file)) {
            throw new Error("Could not open file `"+ file +"`!");
        }

        var mime, charset, name, extension, i;
        // detect name
        if ((i = file.lastIndexOf("/")) > 0) {
            name = file.substring(i + 1);
        }
        // detect extension
        if ((i = file.lastIndexOf(".")) > 0) {
            extension = file.substring(i + 1);
        }

        // make a shell command
        var tmp = this.execSync("file -i '"+ file +"' | awk '{print $2} {print $3}'");
        if (tmp) {
            tmp = tmp.trim().split("\n");
            if (tmp.length == 2) {
                // remove comma
                mime = (tmp[0].lastIndexOf(";") > -1)
                    ? tmp[0].trim().substring(0, tmp[0].length - 1) : tmp[0];
                // detect charset
                charset = tmp[1].trim().split("=")[1];
            }

            return {mime: mime, charset: charset, name: name, extension: extension};
        }
    },

    /**
     * Simply file checker.
     * @public
     *
     * @param  {String} file
     * @return {Boolean}
     */
    fileExists: function(file){
        try { fs.statSync(file); return true; }
            catch (e) { return false; }
    },

    /**
     * Base64 helper.
     * @public
     *
     * @type {Object}
     */
    Base64: {
        /**
         * Encoding.
         * @type {String}
         */
        encoding: "utf-8",

        /**
         * Encoder.
         * @public
         *
         * @param  {String} data
         * @return {String}
         */
        encode: function(data){
            return (new Buffer(data)).toString("base64");
        },

        /**
         * Decoder.
         * @public
         *
         * @param  {String} data
         * @param  {String} encoding
         * @return {String}
         */
        decode: function(data, encoding){
            return (new Buffer(data, "base64")).toString(encoding || this.encoding);
        }
    }
};

/**
 * Expose module.
 */
module.exports = Util;
