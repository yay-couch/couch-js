var Class = require("../util/class");

var Stream = Class.create("Stream", {
    headers: {},
    body: null,

    init: function(headers, body){
        if (headers != null) {
            this.headers = headers;
        }
        if (body != null) {
            this.body = body;
        }
    },

    setBody: function(){}, // abstract
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
    getHeaderAll: function(){
        return this.headers;
    }
});

module.exports = Stream;
