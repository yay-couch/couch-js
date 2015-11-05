var Couch = {};
Couch.NAME = "CouchJS";
Couch.VERSION = "1.0";

Couch.Util = require("./util/util");

Couch.Couch = function(config){
    this.config = {};
};

Couch.Util.extend(Couch.Couch.prototype, {
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
});

Couch.Client = require("./client");

module.exports = Couch;
