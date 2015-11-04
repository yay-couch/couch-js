var Util = {
    extend: function(to, from) {
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    },
    format: function(){
        var args = arguments, s = args[0], ms = s.match(/(%s)/g) || [], i = 1, m;
        while (m = ms.shift()) {
            s = s.replace(/(%s)/, args[i++]);
        }
        return s;
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
