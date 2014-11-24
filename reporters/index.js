var Q = require('q');

exports.create = function(reporters) {
    if (reporters) {
        var allReporters = [];
        for (var reporter in reporters) {
            if (reporters.hasOwnProperty(reporter)) {
                allReporters.push(require('./' + reporter + '.js')
                    .create(reporters[reporter]));
            };
        }

        return {
            report: function(url, response, time, success) {
                allReporters.forEach(function(reporter) {
                    reporter.report(url, response, time, success);
                });
            },
            summarise: function(passes, failures) {
                var allSummaries = allReporters.map(function(reporter) {
                    return reporter.summarise(passes, failures);
                });
                return Q.all(allSummaries);
            }
        }
    } else {
        return require('./console.js').create();
    }
}
