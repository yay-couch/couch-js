var Couch = require("./couch"),
    Class = require("./util/class"),
    Util = require("./util/util");

var Client = Class.create("Client", {
    __init__: function(couch){
        this.couch = couch;

        this.host = "localhost";
        this.port = 5984;
        this.username = null;
        this.username = null;

        var config = this.couch.config;
        if ("host" in config) this.host = config.host;
        if ("port" in config) this.port = config.port;

        if ("username" in config) this.username = config.username;
        if ("password" in config) this.password = config.password;

        this.Request = null;
        this.Response = null;
    },
    request: function(uri, options){
        options = options || {};

        var Request = require("./http/request"),
            Response = require("./http/response");

        var uriType = typeof uri;
        if (uriType == "string") {
            var r = uri.trim().match(/^([a-z]+)\s+(.+)/i);
            if (!r || !(r.length == 3)) {
                throw new Error("Usage: <REQUEST METHOD> <REQUEST URI>");
            }
            options.method = r[1], options.uri = r[2];
        } else if (uriType == "object") {
            Util.extend(options, uri);
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
                _this.Request.send(callback);
            }
        };
    },
    getRequest: function(){
        return this.Request;
    },
    getResponse: function(){
        return this.Response;
    }
});

module.exports = Client;
