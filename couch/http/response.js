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
        if (typeof statusText == "number") {
            for (var i in Response.STATUS) {
                if (Response.STATUS[i][statusText]) {
                    statusText = Response.STATUS[i][statusText];
                }
            }
        }
        this.statusText = statusText;
        return this;
    },
    getStatusText: function(){
        return this.statusText;
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
    OK: {200: "OK"},
    CREATED: {201: "Created"},
    ACCEPTED: {202: "Accepted"},
    NOT_MODIFIED: {304: "Not Modified"},
    BAD_REQUEST: {400: "Bad Request"},
    UNAUTHORIZED: {401: "Unauthorized"},
    FORBIDDEN: {403: "Forbidden"},
    NOT_FOUND: {404: "Not Found"},
    RESOURCE_NOT_ALLOWED: {405: "Resource Not Allowed"},
    NOT_ACCEPTABLE: {406: "Not Acceptable"},
    CONFLICT: {409: "Conflict"},
    PRECONDITION_FAILED: {412: "Precondition Failed"},
    BAD_CONTENT_TYPE: {415: "Bad Content Type"},
    REQUESTED_RANGE_NOT_SATISFIABLE: {416: "Requested Range Not Satisfiable"},
    EXPECTATION_FAILED: {417: "Expectation Failed"},
    INTERNAL_SERVER_ERROR: {500: "Internal Server Error"}
};

module.exports = Response;
