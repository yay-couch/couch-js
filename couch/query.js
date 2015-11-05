var Class = require("./util/class");

var Query = Class.create("Query", {
    data: {},
    dataString: "",

    __init__: function(data){
        this.data = data || {};
        this.dataString = '';
    },

    set: function(key, value) {
        this.data[key.toLowerCase()] = value;
    },
    get: function(key){
        return this.data[key];
    },
    toString: function(){
        if (this.dataString != "") {
            return this.dataString;
        }

        var data = [], key, value;
        for (var key in this.data) {
            value = this.data[key];
            if (typeof value == "undefined") {
                continue;
            }
            if (value === true || value === false) {
                data[key] = value ? "true" : "false";
            }
            data.push(encodeURIComponent(key) +"="+ encodeURIComponent(value));
        }

        return (this.dataString = data.join("&"));
    },
    skip: function(num){
        this.data.skip = num;
        return this;
    },
    limit: function(num){
        this.data.limit = num;
        return this;
    }
});

module.exports = Query;
