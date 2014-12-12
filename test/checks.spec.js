var proxyquire = require('proxyquire').noCallThru();
var sinon = require('sinon');
var expect = require('chai').expect;

describe('check factory', function() {
    it('returns a default check if non specified', function() {
        var factory = require('../checks');
        var checker = factory.create();
        expect(checker.check).to.exist();
    });

    it('returns a checker containing the specified reporters', function() {
        // Arrange
        var check = sinon.spy();
        var factory = proxyquire('../checks', {
            './mock.js': {
                create: function() { return {
                    check: check,
                }}
            }
        });

        // Act
        var checker = factory.create({ mock: {} });
        var url = 'http://test.example.com', response = { status: 200 }, time = 132;
        checker.check(url, response, time);

        // Assert
        expect(check.calledWith(url, response, time)).to.be.true();
    });

    it('passes config to the specified checks', function() {
        // Arrange
        var actualConfig = null;
        var factory = proxyquire('../checks', {
            './mock.js': {
                create: function(config) { actualConfig = config; }
            }
        });

        // Act
        var reporter = factory.create({ mock: { foo: 'bar' } });

        // Assert
        expect(actualConfig.foo).to.eq('bar');
    });
});
