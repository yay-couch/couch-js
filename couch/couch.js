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

Couch.Client = function(couch){
    this.couch = couch;



    this.host = "localhost";
    this.port = 5984;
    this.username = null;
    this.username = null;

    this.Request = null;
    this.Response = null;

    var config = this.couch.config;
    if ("host" in config) this.host = config.host;
    if ("port" in config) this.port = config.port;

    if ("username" in config) this.username = config.username;
    if ("password" in config) this.password = config.password;
};


Couch.Util.extend(Couch.Client.prototype, {
    request: function(uri, options){
        var Request = require('./http/request'),
            Response = require('./http/response');

        var method, uri;
        options = options || {};

        var uriType = typeof uri;
        if (uriType == "string") {
            var r = uri.trim().match(/^([a-z]+)\s+(.+)/i);
            if (!r || !(r.length == 3)) {
                throw new Error("Usage: <REQUEST METHOD> <REQUEST URI>");
            }
            options.method = r[1], options.uri = r[2];
        } else if (uriType == "object") {
            Couch.Util.extend(options, uri);
        }

        if (!options.method || !options.uri) {
            throw new Error("You should provide both method & uri");
        }


        this.Request = new Request(this);
        this.Response = new Response();

        this.Request
            .setMethod(options.method)
            .setUri(options.uri, options.uriParams);

        if (options.headers) {
            for (var key in options.headers) {
                this.Request.setHeader(key, options.headers[key]);
            }
        }

        this.Request.setBody(options.body);

        var _this = this;
        return {
            done: function(callback){
                _this.Request.send(_this, callback);
            }
        };

        var options = {
            host: this.host,
            port: this.port,
            method: r[1],
            path: r[2]
        };

        var req = require("http").request(options, function(res) {
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
    },
    getRequest: function(){
        return this.Request;
    },
    getResponse: function(){
        return this.Response;
    }
});

module.exports = Couch;
