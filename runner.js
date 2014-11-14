var Q = require('q');

exports.run = function(client, urls, reporter, checker) {
    var requests = [];

    urls.forEach(function(url) {
        var start = process.hrtime();
        requests.push(client.request(url).then(function(response) {
            var time = process.hrtime(start);
            reporter.report(url, response, time);
            checker.check(url, response);
        }));
    });

    return Q.all(requests).then(function() {
        return checker.failures;
    });
};
