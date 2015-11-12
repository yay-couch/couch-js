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

var Couch = {};
Couch.NAME = "Couch";
Couch.VERSION = "1.0";

Couch.Couch = function(config){
    this.setConfig(config);
};

Couch.Couch.prototype = {
    config: {},
    setConfig: function(config){
        if (config) {
            for (var i in config) {
                this.config[i] = config[i];
            }
        }
    },
    getConfig: function(){
        return this.config;
    }
};

global.Couch = Couch;
global.isNone = function(input){
    return (input == null);
};
global.isInstanceOf = function(a, b){
    return (a instanceof b);
};

Couch.Util = require("./util/util");
Couch.Query = require("./query");
Couch.Client = require("./client");
Couch.Server = require("./server");
Couch.Database = require("./database");
Couch.Document = require("./document");
Couch.DocumentAttachment = require("./document_attachment");
Couch.DocumentDesign = require("./document_design");
Couch.Uuid = require("./uuid");

module.exports = Couch;
