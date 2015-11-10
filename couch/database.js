var Class = require("./util/class"),
    Client = require("./client");

var Database = Class.create("Database", {
    client: null,
    name: undefined,
    __init__: function(client, name){
        if (!client || !(client instanceof Client)) {
            throw new Error("Given client must be instance of Couch.Client!");
        }
        if (!name) {
            throw new Error("Name must be a valid database name!");
        }
        this.client = client;
        this.name = name;
    },
    ping: function(callback){
        return this.client.head("/"+ this.name, null, callback);
    }
});

module.exports = Database;
