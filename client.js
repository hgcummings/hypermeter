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
                'include': true
            }
            extend(options, config);
            return Q.nfcall(curl.request, options).then(function(curlOutput) {
                var stdout = curlOutput[0];
                var lines = stdout.split('\n');
                var result, currentLine;
                var headers = [];
                for (var i = 0; (currentLine = lines[i]) || !result; ++i) {
                    if (!result) {
                        result = /^\s*HTTP\/[\d.]+\s+(\d{3})/.exec(currentLine)[1];
                    } else {
                        var colonPos = currentLine.indexOf(':')
                        if (colonPos !== -1) {
                            headers[currentLine.substring(0, colonPos).trim()] =
                                currentLine.substring(colonPos + 1).trim();
                        }
                    }
                }

                return {
                    status: result,
                    headers: headers
                }
            });
        }

        return HTTP.request(url).then(function(response) { return response; });
    };

    return self;
}
