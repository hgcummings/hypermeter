var proxyquire = require('proxyquire').noCallThru();
var expect = require('chai').expect;
var sinon = require('sinon');

describe('reporter factory', function() {

    it('returns a default reporter if non specified', function() {
        var factory = require('../reporters');
        var reporter = factory.create();
        expect(reporter.report).to.exist();
    });

    it('returns a reporter containing the specified reporters', function() {
        // Arrange
        var report = sinon.spy();
        var factory = proxyquire('../reporters', {
            './mock.js': {
                create: function() { return {
                    report: report,
                }}
            }
        });

        // Act
        var reporter = factory.create({ mock: {} });
        var url = 'http://test.example.com', response = { status: 200 }, time = 132, success = true;
        reporter.report(url, response, time, success);

        // Assert
        expect(report.calledWith(url, response, time, success)).to.be.true();
    });

    it('passes config to the specified reporters', function() {
        // Arrange
        var actualConfig = null;
        var factory = proxyquire('../reporters', {
            './mock.js': {
                create: function(config) { actualConfig = config; }
            }
        });

        // Act
        var reporter = factory.create({ mock: { foo: 'bar' } });

        // Assert
        expect(actualConfig.foo).to.equal('bar');
    });
});
