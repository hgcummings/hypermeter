exports.create = function(reporters) {
    if (reporters) {
        var allReporters = reporters.map(function(name) { return require('./' + name + '.js'); });
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
        return require('./console.js');
    }
}
