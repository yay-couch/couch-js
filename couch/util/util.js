var fs = require('fs');
var cp = require("child_process");

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
    quote: function(input){
        return input.replace(/"/g, "%22");
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
    },
    // tnx => strongloop.com/strongblog/whats-new-in-node-js-v0-12-execsync-a-synchronous-api-for-child-processes/
    execSync: function(cmd, options) {
        if (cp.execSync) {
            return cp.execSync(cmd, options || {});
        }
        // add .tmp extensions @kerem
        cp.exec(cmd + " 2>&1 1>output.tmp && echo done! > done.tmp");
        while (!fs.existsSync("done.tmp")) {}
        // add utf-8 @kerem
        var output = fs.readFileSync("output.tmp", "utf-8");
        fs.unlinkSync("output.tmp");
        fs.unlinkSync("done.tmp");
        return output;
    },
    fileInfo: function(file){
        if (this.fileExists(file)) {
            var mime, charset, extension, i;
            if ((i = file.lastIndexOf(".")) > -1) {
                extension = file.substring(i + 1);
            }
            var tmp = this.execSync("file -i '"+ file +"' | awk '{print $2} {print $3}'");
            if (tmp) {
                tmp = tmp.trim().split("\n");
                if (tmp.length == 2) {
                    mime = (tmp[0].lastIndexOf(";") > -1)
                        ? tmp[0].trim().substring(0, tmp[0].length - 1) : tmp[0];
                    charset = tmp[1].trim().split("=")[1];
                }
                return {mime: mime, charset: charset, extension: extension};
            }
        }
    },
    fileExists: function(file){
        try { fs.statSync(file); return true; }
            catch (e) { return false; }
    }
};

module.exports = Util;
