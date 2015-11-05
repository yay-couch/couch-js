var Class = (function() {
    return {
        create: function(name, prototype){
            function Class() {
                if (this.__init__ && this.__init__.apply) {
                    this.__init__.apply(this, arguments);
                }
            }
            Class.prototype = prototype;
            Class.prototype.constructor = Class;
            return Class;
        },
        extend: function(target, source) {
            for (var i in source) {
                target.prototype[i] = source[i];
            }
            return target;
        }
    };
})();

module.exports = Class;
