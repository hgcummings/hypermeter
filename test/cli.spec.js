var helpers = require('./helpers.js');
var given = require('./builder.js').given;
var when = require('./builder.js').when;
var expect = require('chai').expect;

describe('command line interface', function() {
    it('should request a config file if none specified', function(done) {
        when().iRunTheApplication()
        .then(function(exitCode, output, errorOutput) {
            expect(exitCode).to.equal(1);
            expect(errorOutput).to.contain('specify a config file');
            done();
        });
    });

    describe('returnCode', function() {
        var server;
        var configFilename;

        before(function(done) {
            server = helpers.startServer(function(req, res) {
                res.statusCode = req.url.substring(1, 4);
                res.end();
            }, done);
        });

        after(function(done) {
            server.close(done);
        });

        it('should be 0 if only URL returns good responses', function(done) {
            given().aConfigFile().withUrl('http://localhost:55557/200')
            .when().iRunTheApplication()
            .then(function(exitCode) {
                expect(exitCode).to.equal(0);
                done();
            });
        });

        it('should be 1 if only URL returns a bad response', function(done) {
            given().aConfigFile().withUrl('http://localhost:55557/500')
            .when().iRunTheApplication()
            .then(function(exitCode) {
                expect(exitCode).to.equal(1);
                done();
            });
        });

        it('should be 0 if all URLs return good responses', function(done) {
            given().aConfigFile()
                .withUrl('http://localhost:55557/200')
                .withUrl('http://localhost:55557/204')
            .when().iRunTheApplication()
            .then(function(exitCode) {
                expect(exitCode).to.equal(0);
                done();
            });
        });

        it('should be the number of failures if some URLs fail', function(done) {
            given()
                .aConfigFile()
                    .withUrl('http://localhost:55557/200')
                    .withUrl('http://localhost:55557/500')
                    .withUrl('http://localhost:55557/501')
            .when().iRunTheApplication()
            .then(function(exitCode) {
                expect(exitCode).to.equal(2);
                done();
            });
        });
    });
});
