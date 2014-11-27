var Q = require('q');

exports.run = function(client, urls, reporter, checker) {
    var requests = [];
    var passes = [];
    var failures = [];

    urls.forEach(function(url) {
        var start = process.hrtime();
        requests.push(client.request(url).then(function(response) {
            var elapsed = process.hrtime(start);
            var millis = elapsed[0] * 1e3 + Math.round(elapsed[1] / 1e6);
            var success = checker.check(url, response);
            if (success) {
                passes.push(url);
            } else {
                failures.push(url);
            }
            reporter.report(url, response, millis, success);
        }, function(error) {
           console.log(error);
        }));
    });

    return Q.all(requests)
        .then(function() {
            return reporter.summarise(passes, failures);
        })
        .then(function() {
            return failures;
        });
};
