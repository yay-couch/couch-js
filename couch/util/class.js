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
            return Class;
        },
        extend: function(target, source) {
            for (var i in source) {
                // skip private props
                if (0 === i.indexOf("_")) {
                    continue;
                }
                target.prototype[i] = source[i];
            }
            return target;
        }
    };
})();
