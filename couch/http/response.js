var Couch = require("../couch"),
    Class = require("../util/class"),
    Stream = require("./stream");

var Response = Class.create("Response", {
    statusCode: undefined,
    statusText: undefined,

    __init__: function(agent){
        //
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
    }
});

Class.extend(Response, Stream.init({}, null));

Class.extend(Response, {
    setBody: function(body, isJson){
        this.body = (isJson !== false)
            ? JSON.parse(body) : body;
        return this;
    }
});

Response.STATUS = {
    OK: 200
};

module.exports = Response;
