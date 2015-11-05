var Class = require("./util/class"),
    Util = require("./util/util");

var Request = require("./http/request"),
    Response = require("./http/response");

var Client = Class.create("Client", {
    couch: null,
    host: "localhost",
    port: 5984,
    username: null,
    username: null,
    Request: null,
    Response: null,
    __init__: function(couch){
        this.couch = couch;
        var config = this.couch.getConfig();
        if ("host" in config) this.host = config.host;
        if ("port" in config) this.port = config.port;
        if ("username" in config) this.username = config.username;
        if ("password" in config) this.password = config.password;
    },
    getRequest: function(){
        return this.Request;
    },
    getResponse: function(){
        return this.Response;
    },
    request: function(uri, options){
        options = options || {};

        var uriType = typeof uri;
        if (uriType == "string") {
            var r = uri.trim().match(/^([a-z]+)\s+(.+)/i);
            if (!r || !(r.length == 3)) {
                throw new Error("Usage: <REQUEST METHOD> <REQUEST URI>!");
            }
            options.method = r[1], options.uri = r[2].replace(/\/+/g, "/");
        } else if (uriType == "object") {
            Util.extend(options, uri);
        }

        if (!options.method || !options.uri) {
            throw new Error("You should provide both method & uri!");
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
    head: function(uri, options, callback){
        return this.request(Request.METHOD.HEAD +" /"+ uri, options).done(callback);
    }
});

module.exports = Client;
