var Class = require("./util/class");

var Server = Class.create("Server", {
    client: null,

    __init__: function(client){
        if (!client) {
            throw new Error("Client must me instance of Couch.Client!");
        }
        this.client = client;
    },

    ping: function(callback){
        return this.client.head("/", {}, callback);
    }
});

module.exports = Server;
