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
        return this.client.head(this.name, null, callback);
    },
    info: function(key, callback) {
        return this.client.get(this.name, null, function(stream){
            return callback(stream, stream.response.getData(key));
        });
    },
    create: function(callback){
        return this.client.put(this.name, null, callback);
    },
    remove: function(callback){
        return this.client.delete(this.name, null, callback);
    }
});

module.exports = Database;
