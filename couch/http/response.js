var Class = require("../util/class"),
    Stream = require("./stream");

var Response = Class.create("Response", {
    statusCode: undefined,
    statusText: undefined,

    __init__: function(){
        this.type = Stream.TYPE.RESPONSE;
        this.httpVersion = "1.1";
    },

    setStatusCode: function(statusCode){
        this.statusCode = statusCode;
        return this;
    },
    getStatusCode: function(){
        return this.statusCode;
    },
    setStatusText: function(statusText){
        if (typeof statusText == "number"
                && statusText in Response.STATUS) {
            statusText = Response.STATUS[statusText];
        }
        this.statusText = statusText;
        return this;
    },
    getStatusText: function(){
        return this.statusText;
    },
    isStatusCode: function(statusCode){
        return (this.statusCode === statusCode);
    }
});

Class.extend(Response, Stream.init({}, null));

Class.extend(Response, {
    setBody: function(body, isJson){
        if (body != null) {
            this.body = (isJson !== false)
                ? JSON.parse(body) : body;
        }
        return this;
    }
});

Response.STATUS = {
    200: "OK",
    201: "Created",
    202: "Accepted",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Resource Not Allowed",
    406: "Not Acceptable",
    409: "Conflict",
    412: "Precondition Failed",
    415: "Bad Content Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    500: "Internal Server Error"
};

module.exports = Response;
