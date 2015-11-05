module.exports = (function() {
    return {
        create: function(name, prototype){
            function Class() {
                // should be function
                if (this.__init__) {
                    this.__init__.apply(this, arguments);
                }
            }
            Class.prototype = prototype;
            Class.prototype.constructor = Class;
            // just for debug
            Class.prototype.constructor.nameOrig = name;
            return Class;
        },
        extend: function(target, source) {
            for (var i in source) {
                // skip private stuff
                if (0 === i.indexOf("_")) {
                    continue;
                }
                if (target.prototype) {
                    target.prototype[i] = source[i];
                } else {
                    target[i] = source[i];
                }
            }
            return target;
        }
    };
})();
