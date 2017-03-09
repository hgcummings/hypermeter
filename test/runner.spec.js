var sinon = require('sinon');
var expect = require('chai').expect;
var assert = require('assert');
var Q = require('q');
var cases = require('cases');

describe('runner', function() {
    it('follows redirects', cases([['Location'], ['location']], function(headerName, done) {
        // Arrange
        var client = {
            request: sinon.stub()
        };
        var redirectFrom = 'http://test.example.com/redirectFrom';
        var redirectTo = 'http://test.example.com/redirectTo';

        var urls = [redirectFrom];
        var reporter = {
            report: sinon.spy(),
            summarise: function() {
                return Q('Done');
            }
        };
        var checker = { check: sinon.spy() };
        var runner = require('../runner.js');

        var headers = {};
        headers[headerName] = redirectTo;

        client.request.withArgs(redirectFrom).returns(Q({
            status: 302,
            headers: headers
        }));

        client.request.withArgs(redirectTo).returns(Q({
            status: 200
        }));

        // Act
        runner.run(client, urls, reporter, checker).then(function() {
            // Assert
            assert(reporter.report.calledWith(redirectFrom));
            assert(reporter.report.calledWith(redirectTo));
            assert(!isNaN(reporter.report.firstCall.args[2]));

            assert(!checker.check.calledWith(redirectFrom));
            assert(checker.check.calledWith(redirectTo));
        }).then(done).done();
    }));

    it('returns a failed request as a failure', function(done) {
        // Arrange
        var client = {
            request: sinon.stub()
        };
        var failingUrl = 'https://test.example.com/failsRequest';

        var urls = [failingUrl];
        var reporter = {
            report: sinon.spy(),
            summarise: sinon.spy()
        };
        var checker = { check: sinon.spy() };
        var runner = require('../runner.js');

        client.request.withArgs(failingUrl).returns(
            Q.fcall(function() {
                throw 'Request failure error message';
            })
        );

        // Act
        runner.run(client, urls, reporter, checker).then(function() {
            // Assert
            assert(reporter.summarise.calledWith([], [failingUrl]));
        }).then(done).done();
    });
})
