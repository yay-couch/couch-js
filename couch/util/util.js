var Util = {
    extend: function(to, from) {
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    },
    forEach: function(input, fn, scope){
        var len = input && input.length, i;
        if (typeof len !== "undefined") {
            for (i = 0; i < len; i++) {
                if (false === fn.call(scope || input[i], i, input[i], input)) {
                    break;
                }
            }
        } else {
            for (i in input) {
                if (false === fn.call(scope || input[i], i, input[i], input)) {
                    break;
                }
            }
        }
        return scope || input;
    }
};

module.exports = Util;
