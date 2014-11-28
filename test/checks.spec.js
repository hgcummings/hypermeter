var assert = require('assert');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var expect = require('chai').expect;

describe('check factory', function() {

    it('returns a default check if non specified', function() {
        var factory = require('../checks');
        var checker = factory.create();
        assert(checker.check);
    });

    it('returns a checker containing the specified reporters', function() {
        var check = sinon.spy();

        var factory = proxyquire('../checks', {
            './mock.js': {
                create: function() { return {
                    check: check,
                }},
                '@noCallThru': true
            }
        });
        var checker = factory.create({ mock: {} });

        var url = 'http://test.example.com';
        var response = { status: 200 };
        var time = 132;

        checker.check(url, response, time);
        expect(check.calledWith(url, response, time)).to.be.true();
    });

    it('passes config to the specified checks', function() {
        var actualConfig = null;

        var factory = proxyquire('../checks', {
            './mock.js': {
                create: function(config) { actualConfig = config; },
                '@noCallThru': true
            }
        });
        var reporter = factory.create({
            mock: {
                foo: 'bar'
            }
        });

        assert.equal(actualConfig.foo, 'bar');
    });
});
