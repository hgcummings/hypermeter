var assert = require('assert');
var proxyquire = require('proxyquire');

describe('reporter factory', function() {

    it('returns a default reporter if non specified', function() {
        var factory = require('../reporters');
        var reporter = factory.create();
        assert(reporter.report);
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
        assert(called);
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

        assert.equal(actualConfig.foo, 'bar');
    });
});
