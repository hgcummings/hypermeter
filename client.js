var extend = require('extend');
var curl = require('curlrequest');
var Q = require('q');
var HTTP = require('q-io/http');

exports.create = function(config) {
    var self = {};

    self.request = function(url) {
        if (config) {
            var options = {
                url: url,
                'write-out': '%{http_code}'
            }
            extend(options, config);
            return Q.nfcall(curl.request, options).then(function(curlOutput) {
                return {
                    status: curlOutput[0].split('\n').pop()
                }
            });
        }

        return HTTP.request(url).then(function(response) { return response; });
    };

    return self;
}