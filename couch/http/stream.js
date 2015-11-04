var Stream = {
    body: null,
    headers: {},
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
};

module.exports = Stream;
