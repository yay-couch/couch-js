var Class = require("../util/class"),
    Util = require("../util/util");

// http://stackoverflow.com/a/11864828/362780
function extract(key, object) {
    key = key.split(".");
    var k = key.shift();
    return (key.length)
        ? extract(key.join("."), object[k]) : object[k];
}

var Stream = Class.create("Stream", {
    type: undefined,
    httpVersion: undefined,
    headers: {},
    body: null,

    __init__: function(headers, body){
        if (!isNone(headers)) {
            this.headers = headers;
        }
        if (!isNone(body)) {
            this.body = body;
        }
    },
    getData: function(key){
        if (isNone(key)) {
            return this.body;
        }
        return extract(key, this.body || {});
    },
    // abstract
    setBody: function(body){
        // force re-define abstract method
        if (this.__proto__.constructor.nameOrig == "Stream") {
            throw new Error("You should re-define [<OBJECT>].setBody(body) method!");
        }
    },
    getBody: function(){
        return this.body;
    },

    setHeader: function(key, value){
        if (value === null) {
            // remove command
            delete this.headers[key];
        } else {
            this.headers[key] = value;
        }
        return this;
    },
    getHeader: function(key){
        return this.headers[key];
    },
    getHeaderAll: function(){
        return this.headers;
    },
    toString: function(){
        var string = "";
        if (this.type == Stream.TYPE.REQUEST) {
            string = Util.format("%s %s HTTP/%s\r\n", this.method, this.uri, this.httpVersion);
        } else if (this.type == Stream.TYPE.RESPONSE) {
            string = Util.format("HTTP/%s %s %s\r\n", this.httpVersion, this.statusCode, this.statusText);
        }
        var key, value;
        for (key in this.headers) {
            value = this.headers[key];
            if (!isNone(value)) {
                string += Util.format("%s: %s\r\n", key, value);
            }
        }
        string += "\r\n";
        if (this.body != null) {
            string += (typeof this.body == "string") ? this.body : JSON.stringify(this.body);
        }
        return string;
    }
});

Stream.init = function(headers, body){
    return new Stream(headers, body);
};

Stream.TYPE = {
    REQUEST: 1,
    RESPONSE: 2
};

module.exports = Stream;
