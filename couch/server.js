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
    },
    info: function(key, callback) {
        return this.client.get("/", {}, function(req, res){
            return callback(res.getData(key));
        });
    },
    version: function(callback){
        return this.info("version", callback);
    },
    getActiveTasks: function(callback){
        return this.client.get("/_active_tasks", {}, function(req, res){
            return callback(res.getData());
        });
    },
    getAllDatabases: function(callback){
        return this.client.get("/_all_dbs", {}, function(req, res){
            return callback(res.getData());
        });
    },
    getDatabaseUpdates: function(query, callback){
        return this.client.get("/_db_updates", {query: query}, function(req, res){
            return callback(res.getData());
        });
    }
});

module.exports = Server;
