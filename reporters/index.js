exports.create = function(reporters) {
    if (reporters) {
        var allReporters = reporters.map(function(name) { return require('./' + name + '.js'); });
        return {
            report: function(url, response, time) {
                allReporters.forEach(function(reporter) {
                    reporter.report(url, response, time);
                });
            }
        }
    } else {
        return require('./console.js');
    }
}
