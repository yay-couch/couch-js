var Couch = {};
Couch.NAME = "CouchJS";
Couch.VERSION = "1.0";

Couch.Util = require("./util/util");

Couch.Couch = function(config) {
    this.config = {};
    if (config) {
        this.config = Couch.Util.extend(this.config, config);
    }
};

Couch.Client = require("./client");

module.exports = Couch;
