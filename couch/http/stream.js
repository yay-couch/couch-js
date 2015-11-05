var Couch = require("../couch"),
    Class = require("../util/class"),
    Util = require("../util/util");

var Stream = Class.create("Stream", {
    type: undefined,
    httpVersion: undefined,
    headers: {},
    body: null,

    __init__: function(headers, body){
        if (headers != null) {
            this.headers = headers;
        }
        if (body != null) {
            this.body = body;
        }
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
        this.headers[key] = value;
        return this;
    },
    getHeader: function(key){
        return this.headers[key];
    },
    toString: function(){
        var string = "";
        if (this.type == Stream.TYPE.REQUEST) {
            string = Util.format("%s %s HTTP/%s\r\n", this.method, this.uri, this.httpVersion);
            Util.forEach(this.headers, function(key, value){
                // actually remove header command
                if (value !== null) {
                    string += Util.format("%s: %s\r\n", key, value);
                }
            });
        } else if (this.type == Stream.TYPE.RESPONSE) {
            string = Util.format("HTTP/%s %s %s\r\n", this.httpVersion, this.statusCode, this.statusText);
            Util.forEach(this.headers, function(key, value){
                string += Util.format("%s: %s\r\n", key, value);
            });
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
