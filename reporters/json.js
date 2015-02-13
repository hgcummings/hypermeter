var Q = require('q');
var fs = require('fs');
var log = require('loglevel');

exports.create = function(config) {
    var results = [];

    return {
        report: function(url, response, time, success) {
            if (success) {
                results.push({
                    url: url,
                    time: time
                });
            }
        },
        summarise: function(passes, failures) {
            return Q.nfcall(fs.readFile, config.filename)
            .then(function(data) {
                var output = JSON.parse(data);
                results.forEach(function(result) {
                    var found = false;
                    output[config.plotListKey].every(function(plot) {
                        if (plot[config.plotNameKey] === result.url) {
                            found = true;
                            plot.data.push(result.time);
                            return false;
                        }
                        return true;
                    });
                    if (!found) {
                        var plot = { data: [] };
                        plot[config.plotNameKey] = result.url;
                        plot.data = [];
                        output.labels.forEach(function() {
                            plot.data.push(null);
                        })
                        plot.data.push(result.time);
                        output[config.plotListKey].push(plot);
                    }
                });
                output.labels.push(config.build);
                return output;
            }, function(err) {
                log.warn('Could not load existing file, creating from scratch...');

                var plots = [];
                results.forEach(function(result) {
                    var plot = { data: [] };
                    plot[config.plotNameKey] = result.url;
                    plot.data.push(result.time);
                    plots.push(plot);
                })

                var output = {};
                output.labels = [config.build];
                output[config.plotListKey] = plots;
                return output;
            }).then(function(output) {
                return Q.nfcall(fs.writeFile, config.filename, JSON.stringify(output));
            });
        }
    };
}
