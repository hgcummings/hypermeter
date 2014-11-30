var assert = require('assert');
var Q = require('q');
var plotly = require('plotly')(
    process.env.PLOTLY_USERNAME, process.env.PLOTLY_API_KEY);
var log = require('loglevel').setLevel('error');
var proxyquire = require('proxyquire');
var sinon = require('sinon');

describe('graph reporter', function() {
    this.timeout(10000);
    var reporter;
    var filename = 'hypermeter_test';

    it('creates/overwrites file if none specified', function(done) {
        // Arrange
        var config = createConfig().build();
        var logWarn = sinon.spy();
        reporter = proxyquire('../reporters/graph.js', {
            'loglevel': {
                warn: logWarn
            }
        }).create(config);

        // Act
        var url = 'http://test.example.com/';
        var response = 200;
        var time = 123;
        var success = true;
        reporter.report(url, response, time, success);
        reporter.summarise([url], [])

        // Assert
        .then(getFileIdFromWarningLog(logWarn))
        .then(loadFile())
        .then(function(figure) {
            assert.equal(figure.data.length, 1);
            assert.equal(figure.data[0].x, config.build);
            assert.equal(figure.data[0].y, time);
        })
        .then(done).done();
    });

    it('creates plots for successful URLs', function(done) {
        createFile({})
        .then(function(fileId) {
            // Arrange
            var config = createConfig().withFileId(fileId).build();
            reporter = require('../reporters/graph.js').create(config);

            // Act
            var url = 'http://test.example.com/';
            var response = 200;
            var time = 123;
            var success = true;
            reporter.report(url, response, time, success);

            var failureUrl = 'http://failure.example.com';
            reporter.report(failureUrl, 500, 45, false);

            return reporter.summarise([url], [failureUrl])
            // Assert
            .then(loadFile(fileId))
            .then(function(figure) {
                assert.equal(figure.data.length, 1);
                assert.equal(figure.data[0].x, config.build);
                assert.equal(figure.data[0].y, time);
            });
        })
        .then(done).done();
    });


    it('extends an existing graph with new data', function(done) {
        // Arrange
        var existingData = {
            x: 3,
            y: 100,
            name: 'http://test.example.com/existing',
            line: { shape: 'spline' },
            type: 'scatter'
        };

        createFile([existingData])
        .then(function(fileId) {
            var config = createConfig().withFileId(fileId).build();
            reporter = require('../reporters/graph.js').create(config);

            // Act
            var url = 'http://test.example.com/';
            var response = 200;
            var time = 123;
            var success = true;
            reporter.report(url, response, time, success);

            var updatedTime = 234;
            reporter.report(existingData.name, 200, updatedTime, true);

            return reporter.summarise([existingData.name, url], [])
            // Assert
            .then(loadFile(fileId))
            .then(function(figure) {
                var data = figure.data;
                assert.equal(data.length, 2);
                assert.deepEqual(data[0].x, [existingData.x, config.build]);
                assert.deepEqual(data[0].y, [existingData.y, updatedTime]);
                assert.equal(data[1].x, config.build);
                assert.equal(data[1].y, time);
            });
        })
        .then(done).done();
    });

    var createConfig = function() {
        var config = {
            filename: filename,
            username: process.env.PLOTLY_USERNAME,
            apiKey: process.env.PLOTLY_API_KEY,
            build: 4
        };
        var self = {
            withFileId: function(fileId) {
                config.fileId = fileId;
                return self;
            },
            build: function() {
                return config;
            }
        };

        return self;
    }

    var createFile = function(data) {
        return Q.ninvoke(plotly, "plot", data, { filename: filename, fileopt: 'overwrite' })
        .then(function(msg) {
            return msg.url.split('/').pop();
        }).fail(function (error) {
            console.log('Error ' + error);
        });
    }

    var loadFile = function(fileId) {
        var loadFileFromId = function(id) {
            return Q.ninvoke(plotly, 'getFigure', process.env.PLOTLY_USERNAME, id);
        }

        if (fileId) {
            return function() {
                return loadFileFromId(fileId);
            }
        } else {
            return function(deferredFileId) {
                return loadFileFromId(deferredFileId);
            }
        }
    }

    var getFileIdFromWarningLog = function(logWarn) {
        return function() {
            var regex = /created new graph ([\S]+\/)([0-9]+)/i;
            var fileId;
            logWarn.args.forEach(function(args) {
                var match = regex.exec(args[0]);
                if (match) {
                    fileId = match[2];
                }
            })
            assert(fileId);
            return fileId;
        };
    }
});
