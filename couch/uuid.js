var Class = require("./util/class");

var Uuid = Class.create("Uuid", {
    value: undefined,
    __init__: function(value){
        if (value === true) {
            value = Uuid.generate();
        }
        this.setValue(value);
    },
    toString: function(){
        return this.getValue();
    },
    setValue: function(value){
        this.value = value;
    },
    getValue: function(){
        return this.value;
    }
});

Uuid.generate = function(limit){
    if (limit === Uuid.TIMESTAMP) {
        return Math.round((+new Date) / 1000);
    }
    limit = limit || Uuid.HEX_32;
    switch (limit) {
        case Uuid.HEX_8:
        case Uuid.HEX_32:
        case Uuid.HEX_40:
            break;
        default:
            throw new Error("Unimplemented limit given, only 8,32,40 available!");
    }
    return (1 + Math.random()).toString(15).substring(2, 2 + limit);
};

Uuid.HEX_8 = 8;
Uuid.HEX_32 = 32;
Uuid.HEX_40 = 40;
Uuid.TIMESTAMP = 0;

module.exports = Uuid;
