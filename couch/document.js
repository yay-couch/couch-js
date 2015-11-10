var Class = require("./util/class");

var Document = Class.create("Document", {
    id: undefined,
    rev: undefined,
    deleted: false,
    attachments: [],
    database = null,
    data = {},

    __init__: function(database, data){
    }
});

module.exports = Document;
