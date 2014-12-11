var given = require('./builder.js').given;
var when = require('./builder.js').when;
var expect = require('chai').expect;

describe('command line interface', function() {
    it('should request a config file if none specified', function(done) {
        when().iRunTheApplication()
        .then(function(config, exitCode, output, errorOutput) {
            expect(exitCode).to.equal(1);
            expect(errorOutput).to.contain('specify a config file');
            done();
        });
    });

    describe('returnCode', function() {
        it('should be 0 if only URL returns good responses', function(done) {
            given()
                .aConfigFile().withUrlThatReturnsStatus(200)
            .when().iRunTheApplication()
            .then(function(config, exitCode) {
                expect(exitCode).to.equal(0);
                done();
            });
        });

        it('should be 1 if only URL returns a bad response', function(done) {
            given()
                .aConfigFile().withUrlThatReturnsStatus(500)
            .when().iRunTheApplication()
            .then(function(config, exitCode) {
                expect(exitCode).to.equal(1);
                done();
            });
        });

        it('should be 0 if all URLs return good responses', function(done) {
            given()
                .aConfigFile()
                .withUrlThatReturnsStatus(200)
                .withUrlThatReturnsStatus(204)
            .when().iRunTheApplication()
            .then(function(config, exitCode) {
                expect(exitCode).to.equal(0);
                done();
            });
        });

        it('should be the number of failures if some URLs fail', function(done) {
            given()
                .aConfigFile()
                .withUrlThatReturnsStatus(200)
                .withUrlThatReturnsStatus(500)
                .withUrlThatReturnsStatus(501)
            .when().iRunTheApplication()
            .then(function(config, exitCode) {
                expect(exitCode).to.equal(2);
                done();
            });
        });
    });
});
