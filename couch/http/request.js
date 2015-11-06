var Class = require("../util/class"),
    Stream = require("./stream"),
    Util = require("../util/util"),
    Query = require("../query");

var http = require("http");

var Request = Class.create("Request", {
    client: null,
    method: undefined,
    uri: undefined,

    __init__: function(client){
        this.type = Stream.TYPE.REQUEST;
        this.httpVersion = "1.0";
        this.client = client;
        if (this.client.username && this.client.password) {
            this.headers["Authorization"] = Util.format(
                "Basic %s", Base64.encode(this.client.username +":"+ this.client.password));
        }
        this.headers["Host"] = Util.format("%s:%s", this.client.host, this.client.port);
        this.headers["Connection"] = "close";
        this.headers["Accept"] = "application/json";
        this.headers["Content-Type"] = "application/json";
        this.headers["User-Agent"] = Util.format(
            "%s/v%s (+http://github.com/qeremy/couch-js)", Couch.NAME, Couch.VERSION);
    },

    send: function(callback){
        if (callback && callback.call) {
            var options = {
                  host: this.client.host,
                  port: this.client.port,
                method: this.client.Request.method,
                  path: this.client.Request.uri,
               headers: this.client.Request.headers
            }, $this = this;

            var request = http.request(options, function(response){
                response.setEncoding("utf8");
                var headers = request._header.trim().split("\r\n");
                headers.shift();
                Util.forEach(headers, function(i, header){
                    var tmp = header.split(":");
                    if (tmp.length == 2) {
                        $this.client.Request.setHeader(tmp.shift(), tmp.join(":").trim());
                    }
                });

                Util.forEach(response.headers, function(key, value){
                    key = key.split("-").map(function(k){
                        return k.substr(0, 1).toUpperCase() + k.substr(1);
                    }).join("-");
                    $this.client.Response.setHeader(key, value);
                });

                $this.client.Response.setStatusCode(response.statusCode);
                $this.client.Response.setStatusText(response.statusCode);

                response.on("data", function(data){
                    $this.client.Response.setBody(data,
                        $this.client.Response.getHeader("Content-Type") == "application/json");
                });

                response.on("end", function(){
                    callback({
                        error: null,
                        request: $this.client.Request,
                        response: $this.client.Response
                    }, $this.client.Response.getData());
                });
            }).on("error", function(error) {
                callback({
                    error: error,
                    request: $this.client.Request,
                    response: $this.client.Response
                }, $this.client.Response.getData());
            });

            var body = $this.client.Request.getBody();
            if (!isNone(body)) {
                request.write(body);
            }

            request.end();
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
        if (this.method != Request.METHOD.HEAD &&
            this.method != Request.METHOD.GET &&
            body != null) {
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
  DELETE: "DELETE",
    COPY: "COPY"
};

module.exports = Request;
