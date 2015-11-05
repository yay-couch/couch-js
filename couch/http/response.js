var Couch = require("../couch"),
    Class = require("../util/class"),
    Stream = require("./stream");

var Response = Class.create("Response", {
    statusCode: undefined,
    statusText: undefined,

    __init__: function(agent){
        Class.extend(this, Stream.prototype);
    },

    setStatusCode: function(statusCode){
        this.statusCode = statusCode;
        return this;
    },
    setStatusText: function(statusText){
        this.statusText = statusText;
        return this;
    },
    getStatusCode: function(){
        return this.statusCode;
    },
    getStatusText: function(){
        return this.statusText;
    },
    // abstract
    setBody: function(body, isJson){
        this.body = (isJson !== false)
            ? JSON.parse(body) : body;
        return this;
    }
});

// Class.extend(Response, Stream.init());

Response.STATUS = {
    OK: 200
};

module.exports = Response;
