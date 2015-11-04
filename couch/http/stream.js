var Stream = {
    body: null,
    headers: {},
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
    getHeaderAll: function(){
        return this.headers;
    }
};

module.exports = Stream;
