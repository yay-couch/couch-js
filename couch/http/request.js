var Couch = require("../couch"),
    Query = require("../query"),
    Class = require("../util/class"),
    Stream = require("./stream");

var Request = Class.create("Request", {
    client: null,
    method: undefined,
    uri: undefined,

    init: function(client){
        this.client = client;

        this.method = undefined;
        this.uri    = undefined;

        // add stream stuff
        var stream = new Stream({
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": Couch.Util.format(
                "%s/v%s (+http://github.com/qeremy/couch-js)", Couch.NAME, Couch.VERSION)
        });
        console.log(stream)
        for (var i in Stream) {
            this[i] = Stream[i];
        }

        if (client.username && client.password) {
            // this.headers["Authorization"] = Couch.Util.format(
            //     "Basic %s", Base64.encode(client.username +":"+ client.password));
        }

        // add default headers
        // this.headers["Accept"] = "application/json";
        // this.headers["Content-Type"] = "application/json";
        // this.headers["User-Agent"] = Couch.Util.format(
        //     "%s/v%s (+http://github.com/qeremy/couch-js)", Couch.NAME, Couch.VERSION);
    },

    send: function(client, callback){
        if (callback && callback.call) {
            var request = client.Request,
                response = client.Response;
            return callback(request, response);
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
    },
    // abstract
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
