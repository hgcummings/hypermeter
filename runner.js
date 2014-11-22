var Q = require('q');

exports.run = function(client, urls, reporter, checker) {
    var requests = [];

    urls.forEach(function(url) {
        var start = process.hrtime();
        requests.push(client.request(url).then(function(response) {
            var elapsed = process.hrtime(start);
            var millis = elapsed[0] * 1e3 + Math.round(elapsed[1] / 1e6);
            var success = checker.check(url, response);
            reporter.report(url, response, millis, success);
        }, function(error) {
           console.log(error);
        }));
    });

    return Q.all(requests).then(function() {
        reporter.summarise(checker.passes, checker.failures);
        return checker.failures;
    });
};
