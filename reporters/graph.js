var Q = require('q');
var log = require('loglevel');

var resolve = function resolve(value) {
    if (value && value[0] === '$') {
        return process.env[value.substr(1)];
    } else {
        return value;
    }
}

exports.create = function(config) {
    var username = resolve(config.username);
    var apiKey = resolve(config.apiKey);
    var build = resolve(config.build);
    var fileId = resolve(config.fileId);
    var filename = resolve(config.filename);
    var dataPoints = [];

    var plotly = require('plotly')(username, apiKey);
    var plot = Q.nbind(plotly.plot, plotly);

    var plotTraces = function(existingTraces) {
        var updatedTraces = [];
        var updatedTraceKeys = [];
        var newTraces = [];

        dataPoints.forEach(function(dataPoint) {
            var existingTraceIndex = existingTraces.indexOf(dataPoint.name);
            if (existingTraceIndex !== -1) {
                updatedTraces.push(dataPoint);
                updatedTraceKeys.push(existingTraceIndex);
            } else {
                newTraces.push(dataPoint);
            }
        });

        var layout = {
            xaxis: {
                type: 'category',
                title: 'Build'
            },
            yaxis: {
                title: 'Response time (ms)'
            }
        };

        var plotNewTraces = function() {
            if (newTraces.length) {
                log.debug('Writing new traces...');
                return plot(newTraces, {
                    layout: layout,
                    filename: filename,
                    fileopt: existingTraces.length ? 'append' : 'overwrite'
                });
            } else {
                return Q('Done');
            }
        };

        if (updatedTraces.length) {
            log.debug('Writing updated traces...');
            return plot(updatedTraces, {
                layout: layout,
                filename: filename,
                fileopt: 'extend',
                traces: updatedTraceKeys
            }).then(function() {
                return plotNewTraces();
            });
        } else {
            return plotNewTraces();
        }
    }

    return {
        report: function(url, response, time, success) {
            if (success) {
                dataPoints.push({
                    x: build,
                    y: time,
                    name: url,
                    line: {shape: "spline"},
                    type: 'scatter'
                });
            }
        },
        summarise: function(passes, failures) {
            log.debug('Graph summarise...');
            return Q.ninvoke(plotly, "getFigure", username, fileId)
            .then(function(figure) {
                return figure.data.map(function(trace) { return trace.name; });
            })
            .then(plotTraces);
        }
    };
}
