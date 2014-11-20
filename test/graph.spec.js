var assert = require('assert');
var plotly = require('plotly')(
    process.env.PLOTLY_USERNAME, process.env.PLOTLY_API_KEY);
var graphReporter = require('../reporters/graph.js');

describe('graph reporter', function() {
    this.timeout(5000);
    var testFilename = 'hypermeter_test';
    var fileId;
    var reporter;

    beforeEach(function(done) {
        var data = { };
        var opts = { filename: testFilename, fileopt: 'overwrite' };
        plotly.plot(data, opts, function(err, msg) {
            assert(!err);
            fileId = msg.url.split('/').pop();
            done();
        });
    });

    it('creates/overwrites filename if no id specified', function(done) {
        var config = {
            filename: testFilename,
            username: process.env.PLOTLY_USERNAME,
            apiKey: '$PLOTLY_API_KEY',
            build: 4
        };
        reporter = graphReporter.create(config);

        var url = 'http://test.example.com/';
        var response = 200;
        var time = 123;
        var success = true;

        reporter.report(url, response, time, success);

        reporter.summarise(null, null, function() {
            assert.equal(config.fileId, fileId);
            done();
        });
    });

    it('creates plots for successful URLs', function(done) {
        var config = {
            filename: testFilename,
            username: process.env.PLOTLY_USERNAME,
            apiKey: '$PLOTLY_API_KEY',
            fileId: fileId,
            build: 4
        };
        reporter = graphReporter.create(config);

        var url = 'http://test.example.com/';
        var response = 200;
        var time = 123;
        var success = true;

        reporter.report(url, response, time, success);
        reporter.report('http://failure.example.com', 500, 45, false);

        reporter.summarise([url], [], function() {
            plotly.getFigure(process.env.PLOTLY_USERNAME, fileId, function(err, figure) {
                var data = figure.data;
                assert.equal(1, figure.data.length);
                assert.equal(config.build, figure.data[0].x);
                assert.equal(time, figure.data[0].y);
                done();
            });
        });
    });
});
