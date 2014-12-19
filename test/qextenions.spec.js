var QExtensions = require('../extensions/q.js');
var Q = require('q');
var expect = require('chai').expect;

describe('Q extensions', function() {
    describe('All with descendants', function() {
        it('waits for descendants', function(done) {
            var root = Q.defer();
            var promises = [root.promise];
            var all = QExtensions.allWithDescendants(promises);

            var child = Q.defer();
            promises.push(child.promise);
            root.resolve('Done');

            setTimeout(function() {
                expect(all.inspect().state).to.eql('pending');
                child.resolve('Done');
                setTimeout(function() {
                    expect(all.inspect().state).to.eql('fulfilled');
                    done();
                }, 0);
            }, 0);
        });

        it('resolves results of descendants', function(done) {
            var root = Q.defer();
            var promises = [root.promise];
            var all = QExtensions.allWithDescendants(promises);

            var child = Q.defer();
            promises.push(child.promise);
            root.resolve('Root value');
            child.resolve('Child value');

            setTimeout(function() {
                expect(all.inspect().state).to.eql('fulfilled');
                expect(all.inspect().value).to.eql(['Root value', 'Child value']);
                done();
            }, 0);
        });
    });
})
