var Class = (function() {
    return {
        create: function(name, prototype){
            function Class() {
                if (this.init && this.init.apply) {
                    this.init.apply(this, arguments);
                }
            }
            Class.prototype = prototype;
            Class.prototype.constructor = Class;
            Class.prototype.constructor.nameOrig = name;
            return Class;
        },
        extend: function(target, properties) {
            for (var i in properties) {
                target.prototype[i] = properties[i];
            }
            return target;
        }
    };
})();

module.exports = Class;
