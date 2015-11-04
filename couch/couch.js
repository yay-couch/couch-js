var Couch = {};
// Couch.Http = require("http");

var Util = require("./util/util");
Couch.Util = Util;

Couch.Couch = function(config) {
    this.config = {};
    if (config) {
        this.config = Util.extend(this.config, config);
    }
};

Couch.Client = function(couch){
    this.couch = couch;

    this.host = "localhost";
    this.port = 5984;
    this.username = null;
    this.password = null;

    var config = this.couch.config;
    if ("host" in config) this.host = config.host;
    if ("port" in config) this.port = config.port;

    if ("username" in config) this.username = config.username;
    if ("password" in config) this.password = config.password;
};

Util.extend(Couch.Client.prototype, {
    request: function(uri, uriParams, body, headers){
        var r = uri.trim().match(/^([a-z]+)\s+(.+)/i);
        if (!r || !(r.length == 3)) {
            throw ("Usage: <REQUEST METHOD> <REQUEST URI>");
        }

        var options = {
            host: this.host,
            port: this.port,
            method: r[1],
            path: r[2]
        };

        var req = require('http').request(options, function(res) {
          console.log(res.headers);
          res.on("data", function (chunk) {
            console.log("\r\n\r\n")
            console.log(JSON.parse(chunk))
          });
        })
        // set headers
        // set body
        // ...
        req.end();
    }
});



module.exports = Couch;
