var Q = require('q');
var allWithDescendants = require('./extensions/q.js').allWithDescendants;
var getHeader = require('./extensions/http.js').getHeader;

exports.run = function(client, urls, reporter, checker) {
    var requests = [];
    var passes = [];
    var failures = [];
    var request = function(url) {
        var start = process.hrtime();
        return client.request(url).then(function(response) {
            var elapsed = process.hrtime(start),
                millis = elapsed[0] * 1e3 + Math.round(elapsed[1] / 1e6),
                success;
            if (response.status == 302 && getHeader(response, 'Location')) {
                reporter.report(url, response, millis, success);
                return request(getHeader(response, 'Location'));
            } else {
                success = checker.check(url, response, millis);
                if (success) {
                    passes.push(url);
                } else {
                    failures.push(url);
                }
                reporter.report(url, response, millis, success);
                return Q('Done');
            }
        }, function(error) {
           console.log(url + ': ' + error);
           failures.push(url);
        })
    };

    urls.forEach(function(url) {
        requests.push(request(url));
    });

    return allWithDescendants(requests)
        .then(function() {
            return reporter.summarise(passes, failures);
        })
        .then(function() {
            return failures;
        });
};
