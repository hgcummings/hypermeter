var proxyquire = require('proxyquire');
var expect = require('chai').expect;

describe('reporter factory', function() {

    it('returns a default reporter if non specified', function() {
        var factory = require('../reporters');
        var reporter = factory.create();
        expect(reporter.report).to.exist();
    });

    it('returns a reporter containing the specified reporters', function() {
        var called = false;

        var factory = proxyquire('../reporters', {
            './stubReporter.js': {
                create: function() { return {
                    report: function() { called = true; },
                }},
                '@noCallThru': true
            }
        });
        var reporter = factory.create({ stubReporter: {} });

        reporter.report();
        expect(called).to.be.true();
    });

    it('passes config to the specified reporters', function() {
        var actualConfig = null;

        var factory = proxyquire('../reporters', {
            './stubReporter.js': {
                create: function(config) { actualConfig = config; },
                '@noCallThru': true
            }
        });
        var reporter = factory.create({
            stubReporter: {
                foo: 'bar'
            }
        });

        expect(actualConfig.foo).to.equal('bar');
    });
});
