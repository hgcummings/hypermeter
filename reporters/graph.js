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

    var plot = function(existingTraces, callback) {
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
                plotly.plot(newTraces, {
                    layout: layout,
                    filename: filename,
                    fileopt: existingTraces.length ? 'append' : 'overwrite'
                }, callback);
            } else {
                callback();
            }
        };

        if (updatedTraces.length) {
            log.debug('Writing updated traces...');
            plotly.plot(updatedTraces, {
                layout: layout,
                filename: filename,
                fileopt: 'extend',
                traces: updatedTraceKeys
            }, function(err, msg) {
                if (err) {
                    callback(err, msg);
                } else {
                    plotNewTraces();
                }
            });
        } else {
            plotNewTraces();
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
            return Q.promise(function(resolve, reject) {
                plotly.getFigure(username, fileId, function(err, figure) {
                    log.debug('Loaded graph...');
                    existingTraces = figure.data.map(function(trace) { return trace.name; });
                    plot(existingTraces, resolve);
                });
            });
        }
    };
}
