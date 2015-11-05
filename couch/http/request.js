var Couch = require("../couch"),
    Class = require("../util/class"),
    Stream = require("./stream"),
    Query = require("../query");

var Request = Class.create("Request", {
    client: null,
    method: undefined,
    uri: undefined,

    __init__: function(client){
        this.client = client;
        if (this.client.username && this.client.password) {
            this.headers["Authorization"] = Couch.Util.format(
                "Basic %s", Base64.encode(this.client.username +":"+ this.client.password));
        }
        this.headers["Accept"] = "application/json";
        this.headers["Content-Type"] = "application/json";
        this.headers["User-Agent"] = Couch.Util.format(
            "%s/v%s (+http://github.com/qeremy/couch-js)", Couch.NAME, Couch.VERSION);
    },

    send: function(callback){
        if (callback && callback.call) {
            return callback(this.client.Request, this.client.Response);
        }
    },
    setMethod: function(method) {
        this.method = method.toUpperCase();
        if (this.method != Request.METHOD.HEAD &&
            this.method != Request.METHOD.GET &&
            this.method != Request.METHOD.POST) {
            this.setHeader("X-HTTP-Method-Override", this.method);
        }
        return this;
    },
    setUri: function(uri, uriParams) {
        this.uri = uri;
        if (uriParams) {
            var query = new Query(uriParams);
            this.uri += "?"+ query.toString();
        }
        return this;
    }
});

Class.extend(Request, Stream.init({}, null));

Class.extend(Request, {
    setBody: function(body){
        if (body != null) {
            if (this.headers["Content-Type"] == "application/json") {
                this.body = JSON.stringify(body);
            } else {
                this.body = body;
            }
            this.headers["Content-Length"] = this.body.length;
        }
        return this;
    }
});

// add supported methods by couchdb
Request.METHOD = {
    HEAD: "HEAD",
     GET: "GET",
    POST: "POST",
     PUT: "PUT",
    COPY: "COPY"
};

module.exports = Request;
