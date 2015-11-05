var Class = require("../util/class");

var Stream = Class.create("Stream", {
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

    setBody: function(s){
        // console.log(s)
    }, // abstract
    getBody: function(){
        return this.body;
    },

    setHeader: function(key, value){
        this.headers[key] = value;
        return this;
    },
    getHeader: function(key){
        return this.headers[key];
    }
});

Stream.init = function(headers, body){
    return new Stream(headers, body);
};

module.exports = Stream;
