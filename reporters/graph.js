var resolve = function resolve(value) {
    if (value[0] === '$') {
        return process.env[value.substr(1)];
    } else {
        return value;
    }
}

exports.create = function(config) {
    var username = resolve(config.username);
    var apiKey = resolve(config.apiKey);
    var build = resolve(config.build);
    var traces = [];
    var plotly = require('plotly')(username, apiKey);

    return {
        report: function(url, response, time, success) {
            if (success) {
                var dataPoint = {
                    x: build,
                    y: time,
                    name: url,
                    line: {shape: "spline"},
                    type: 'scatter'
                };
                traces.push(dataPoint);
            }
        },
        summarise: function(passes, failures, callback) {
            var layout = {
                xaxis: {
                    type: 'category',
                    title: 'Build'
                },
                yaxis: {
                    title: 'Response time (ms)'
                }
            };

            plotly.plot(traces, {
                layout: layout,
                filename: config.filename,
                fileopt: 'overwrite'
            }, function (err, msg) {
                config.fileId = msg.url.split('/').pop();
                if (callback) {
                    callback();
                }
            });
        }
    };
}
