var fs = require('fs');
var Q = require('q');

var resolve = function resolve(value) {
    var recur = function(node, resolvedNode) {
        for (var prop in node) {
            if (node.hasOwnProperty(prop)) {
                resolvedNode[prop] = resolve(node[prop]);
            }
        }
        return resolvedNode;
    }

    if (typeof(value) == 'string' && value.length && value[0] === '$') {
        return process.env[value.substr(1)];
    } else if (typeof(value) == 'object') {
        return recur(value, Array.isArray(value) ? [] : {});
    } else {
        return value;
    }
}

module.exports.load = function(path) {
    if (!path) {
        return Q.reject('Please specify a config file, e.g. `hypermeter my-config.json`');
    }

    return Q.nfcall(fs.realpath, path)
    .then(function(realpath) {
        return resolve(require(realpath));
    });
}
