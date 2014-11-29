var assert = require('assert');
var Q = require('q');
var plotly = require('plotly')(
    process.env.PLOTLY_USERNAME, process.env.PLOTLY_API_KEY);
var graphReporter = require('../reporters/graph.js');
var log = require('loglevel').setLevel('error');

describe('graph reporter', function() {
    this.timeout(10000);
    var fileId;
    var reporter;

    beforeEach(function(done) {
        var data = { };
        var config = createConfig().build();
        var opts = { filename: config.filename, fileopt: 'overwrite' };
        Q.ninvoke(plotly, "plot", data, opts)
        .then(function(msg) {
            fileId = msg.url.split('/').pop();
            done();
        }).fail(function (error) {
            console.log('Error ' + error);
        }).done();
    });

    it('creates/overwrites file if none specified', function(done) {
        // Arrange
        var config = createConfig().build();
        reporter = graphReporter.create(config);

        // Act
        var url = 'http://test.example.com/';
        var response = 200;
        var time = 123;
        var success = true;
        reporter.report(url, response, time, success);

        reporter.summarise([url], [])
        // Assert
        .then(function() {
            return Q.ninvoke(plotly, 'getFigure', process.env.PLOTLY_USERNAME, fileId);
        })
        .then(function(figure) {
            assert.equal(figure.data.length, 1);
            assert.equal(figure.data[0].x, config.build);
            assert.equal(figure.data[0].y, time);
            done();
        }).fail(function (error) {
            console.log('Error ' + error);
        }).done();
    });

    it('creates plots for successful URLs', function(done) {
        // Arrange
        var config = createConfig().withFileId().build();
        reporter = graphReporter.create(config);

        // Act
        var url = 'http://test.example.com/';
        var response = 200;
        var time = 123;
        var success = true;
        reporter.report(url, response, time, success);

        var failureUrl = 'http://failure.example.com';
        reporter.report(failureUrl, 500, 45, false);

        reporter.summarise([url], [failureUrl])
        // Assert
        .then(function() {
            return Q.ninvoke(plotly, 'getFigure', process.env.PLOTLY_USERNAME, fileId);
        })
        .then(function(figure) {
            assert.equal(figure.data.length, 1);
            assert.equal(figure.data[0].x, config.build);
            assert.equal(figure.data[0].y, time);
            done();
        }).fail(function (error) {
            console.log('Error ' + error);
        }).done();
    });


    it('extends an existing graph with new data', function(done) {
        // Arrange
        var config = createConfig().withFileId().build();

        var existingData = {
            x: 3,
            y: 100,
            name: 'http://test.example.com/existing',
            line: { shape: 'spline' },
            type: 'scatter'
        };

        Q.ninvoke(plotly, "plot",
            [existingData],
            { filename: config.filename, fileopt: 'overwrite' })
        .then(function() {
            reporter = graphReporter.create(config);

            // Act
            var url = 'http://test.example.com/';
            var response = 200;
            var time = 123;
            var success = true;

            reporter.report(url, response, time, success);

            var updatedTime = 234;

            reporter.report(existingData.name, 200, updatedTime, true);

            return reporter.summarise([existingData.url, url], [])
            // Assert
            .then(function() {
                return Q.ninvoke(plotly, 'getFigure', process.env.PLOTLY_USERNAME, fileId);
            })
            .then(function(figure) {
                var data = figure.data;
                assert.equal(data.length, 2);
                assert.deepEqual(data[0].x, [existingData.x, config.build]);
                assert.deepEqual(data[0].y, [existingData.y, updatedTime]);
                assert.equal(data[1].x, config.build);
                assert.equal(data[1].y, time);
            });
        })
        .then(done)
        .fail(function (error) {
            console.log('Error ' + error);
        })
        .done();
    });

    var createConfig = function() {
        var config = {
            filename: 'hypermeter_test',
            username: process.env.PLOTLY_USERNAME,
            apiKey: process.env.PLOTLY_API_KEY,
            build: 4
        };
        var self = {
            withFileId: function() {
                config.fileId = fileId;
                return self;
            },
            build: function() {
                return config;
            }
        };

        return self;
    }
});
