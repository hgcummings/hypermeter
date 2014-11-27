var assert = require('assert');
var proxyquire = require('proxyquire');

describe('check factory', function() {

    it('returns a default check if non specified', function() {
        var factory = require('../checks');
        var checker = factory.create();
        assert(checker.check);
    });
});
