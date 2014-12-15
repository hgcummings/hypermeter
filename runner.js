var Q = require('q');

exports.run = function(client, urls, reporter, checker) {
    var requests = [];
    var passes = [];
    var failures = [];
    var request = function(url) {
        var start = process.hrtime();
        return client.request(url).then(function(response) {
            var elapsed = process.hrtime(start);

            if (response.status == 302 && response.headers['Location']) {
                reporter.report(url, response, millis, success);
                return request(response.headers['Location']);
            } else {
                var millis = elapsed[0] * 1e3 + Math.round(elapsed[1] / 1e6);
                var success = checker.check(url, response, millis);
                if (success) {
                    passes.push(url);
                } else {
                    failures.push(url);
                }
                reporter.report(url, response, millis, success);
                return Q('Done');
            }
        }, function(error) {
           console.log(error);
        })
    };

    urls.forEach(function(url) {
        requests.push(request(url));
    });

    return Q.all(requests)
        .then(function() {
            return reporter.summarise(passes, failures);
        })
        .then(function() {
            return failures;
        });
};
