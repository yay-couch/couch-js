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
Couch.Uuid = require("./uuid");

module.exports = Couch;
