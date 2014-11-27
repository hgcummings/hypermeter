var responseCodeCheck = require('../checks/responseCode.js');
var expect = require('chai').expect;
var cases = require('cases');

describe('check response code', function() {
    it('returns true for successful status codes', function() {
        var checker = responseCodeCheck.create();

        var result = checker.check('http://test.example.com/', {
            status: 200
        });

        expect(result).to.be.true();
    });

    it('returns false for error status codes', cases([[400], [404], [500], [503]],
        function(code) {
            var checker = responseCodeCheck.create();

            var result = checker.check('http://test.example.com/', {
                status: code
            });

            expect(result).to.be.false();
        })
    );
})
