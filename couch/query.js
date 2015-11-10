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
    toArray: function(){
        return this.data;
    },
    toString: function(){
        if (this.dataString != "") {
            return this.dataString;
        }

        var data = [], key, value;
        for (key in this.data) {
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

Query.parse = function(query, returnQueryObject){
    var pars = query.trim().replace(/&+/g, "&").split('&'),
        par, key, value, re = /^([\w]+)\[(.*)\]/i, ra, ks, ki, i = 0,
        params = {};
    while ((par = pars.shift()) && (par = par.split('=', 2))) {
        key = decodeURIComponent(par[0]);
        // prevent param value going to be "undefined" as string
        value = decodeURIComponent(par[1] || "").replace(/\+/g, " ");
        // check array params
        if (ra = re.exec(key)) {
            ks = ra[1];
            // init array param
            if (!(ks in params)) {
                params[ks] = {};
            }
            // set int key
            ki = (ra[2] != "") ? ra[2] : i++;
            // set array param
            params[ks][ki] = value;
            // go on..
            continue;
        }
        // set param
        params[key] = value;
    }
    return !returnQueryObject ? params : new Query(params);
};

module.exports = Query;
