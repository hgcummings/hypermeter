var timeCheck = require('../checks/time.js');
var expect = require('chai').expect;
var cases = require('cases');

describe('check response time', function() {
    it('returns true for responses faster than or equal to the limit', cases([[0], [1], [2340], [5000]],
        function(time) {
            var checker = timeCheck.create(5000);

            var result = checker.check('http://test.example.com/', {
                status: 200
            }, time);

            expect(result).to.be.true();
        })
    );

    it('returns false for responses slower than the limit', cases([[5001], [10000]],
        function(time) {
            var checker = timeCheck.create(5000);

            var result = checker.check('http://test.example.com/', {
                status: 200
            }, time);

            expect(result).to.be.false();
        })
    );
})
