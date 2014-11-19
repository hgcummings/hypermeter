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
            report: function(url, response, time) {
                allReporters.forEach(function(reporter) {
                    reporter.report(url, response, time);
                });
            },
            summarise: function(passes, failures) {
                allReporters.forEach(function(reporter) {
                    reporter.summarise(passes, failures);
                });
            }
        }
    } else {
        return require('./console.js').create();
    }
}
