var extend = require('extend');
var curl = require('curlrequest');
var Q = require('q');
var HTTP = require('q-io/http');

exports.init = function(config) {
    var self = {};

    self.request = function(url) {
        if (config) {
            var options = {
                url: url
            }
            extend(options, config);
            return Q.nfcall(curl.request, options);
        }

        return HTTP.request(url);
    };

    return self;
}
