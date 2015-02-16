var Q = require('q');
var fs = require('fs');
var randomInt = require('./utils').randomInt;
var expect = require('chai').expect;

describe('json reporter', function() {
    var config;
    var reporter;

    beforeEach(function() {
        config = {
            filename: randomInt() + '.json',
            plotListKey: 'series',
            plotNameKey: 'name',
            build: randomInt()
        }
        reporter = require('../reporters/json.js').create(config);
    });

    afterEach(function(done) {
        Q.nfcall(fs.unlink, config.filename).then(done).done();
    });

    it('creates plots for successful URLs', function(done) {
        var url = 'http://test.example.com/';
        var response = 200;
        var time = 123;
        var success = true;
        reporter.report(url, response, time, success);
        reporter.summarise([url], [])

        //Assert
        .then(function() {
            return Q.nfcall(fs.realpath, config.filename);
        })
        .then(function(realpath) {
            var result = require(realpath);
            expect(result.labels.length).to.equal(1);
            expect(result.labels[0]).to.equal(config.build);
            expect(result[config.plotListKey].length).to.equal(1);
            expect(result[config.plotListKey][0][config.plotNameKey]).to.equal(url);
            expect(result[config.plotListKey][0].data.length).to.equal(1);
            expect(result[config.plotListKey][0].data[0]).to.equal(time);
        })
        .then(done).done();
    });

    it('extends plots for existing data', function(done) {
        var existingUrl = 'http://test.example.com/existing';
        var existingUrlResponseTimes = [123, 234, 345];
        var newUrl = 'http://test.example.com/new';
        var newUrlResponseTime = 789;
        var success = true;

        config.build = 1;
        reporter.report(existingUrl, 200, existingUrlResponseTimes[0], success);
        reporter.summarise([existingUrl], [])
        .then(function() {
            config.build = 2;
            reporter = createReporter();
            reporter.report(existingUrl, 200, existingUrlResponseTimes[1], success);
            return reporter.summarise([existingUrl], []);
        }).then(function() {
            config.build = 3;
            reporter = createReporter();
            reporter.report(existingUrl, 200, existingUrlResponseTimes[2], success);
            reporter.report(newUrl, 200, newUrlResponseTime, success);
            return reporter.summarise([existingUrl, newUrl], []);
        }).then(function() {
            return Q.nfcall(fs.realpath, config.filename);
        }).then(function(realpath) {
            var result = require(realpath);
            expect(result.labels).to.eql([1, 2, 3]);
            expect(result[config.plotListKey].length).to.equal(2);
            expect(result[config.plotListKey][0][config.plotNameKey]).to.equal(existingUrl);
            expect(result[config.plotListKey][0].data).to.eql(existingUrlResponseTimes);
            expect(result[config.plotListKey][1][config.plotNameKey]).to.equal(newUrl);
            expect(result[config.plotListKey][1].data).to.eql([null, null, newUrlResponseTime]);
        })
        .then(done).done();
    });

    it('includes gaps for missing data', function(done) {
        var consistentUrl = 'http://test.example.com/existing';
        var consistentUrlResponseTimes = [123, 234, 345];
        var intermittentUrl = 'http://test.example.com/new';
        var intermittentUrlResponseTimes = [678, null, 789];
        var success = true;

        config.build = 1;
        reporter.report(consistentUrl, 200, consistentUrlResponseTimes[0], success);
        reporter.report(intermittentUrl, 200, intermittentUrlResponseTimes[0], success);
        reporter.summarise([consistentUrl, intermittentUrl], [])
        .then(function() {
            config.build = 2;
            reporter = createReporter();
            reporter.report(consistentUrl, 200, consistentUrlResponseTimes[1], success);
            return reporter.summarise([consistentUrl], []);
        }).then(function() {
            config.build = 3;
            reporter = createReporter();
            reporter.report(consistentUrl, 200, consistentUrlResponseTimes[2], success);
            reporter.report(intermittentUrl, 200, intermittentUrlResponseTimes[2], success);
            return reporter.summarise([consistentUrl, intermittentUrl], []);
        }).then(function() {
            return Q.nfcall(fs.realpath, config.filename);
        }).then(function(realpath) {
            var result = require(realpath);
            expect(result.labels).to.eql([1, 2, 3]);
            expect(result[config.plotListKey].length).to.equal(2);
            expect(result[config.plotListKey][0][config.plotNameKey]).to.equal(consistentUrl);
            expect(result[config.plotListKey][0].data).to.eql(consistentUrlResponseTimes);
            expect(result[config.plotListKey][1][config.plotNameKey]).to.equal(intermittentUrl);
            expect(result[config.plotListKey][1].data).to.eql(intermittentUrlResponseTimes);
        })
        .then(done).done();
    })

    var createReporter = function() {
        return reporter = require('../reporters/json.js').create(config);
    }
});
