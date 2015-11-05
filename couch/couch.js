var Couch = {};
Couch.NAME = "CouchJS";
Couch.VERSION = "1.0";

var Util = require("./util/util");

Couch.Couch = function(config) {
    this.config = {};
    if (config) {
        this.config = Util.extend(this.config, config);
    }
};

Couch.Util = Util;
Couch.Client = require("./client");

module.exports = Couch;
