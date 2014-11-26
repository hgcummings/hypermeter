var assert = require('assert');
var helpers = require('./helpers.js');
var given = require('./builder.js').given;

describe('command line interface', function() {
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
                assert.equal(0, exitCode);
                done();
            });
        });

        it('should be 1 if only URL returns a bad response', function(done) {
            given().aConfigFile().withUrl('http://localhost:55557/500')
            .when().iRunTheApplication()
            .then(function(exitCode) {
                assert.equal(1, exitCode);
                done();
            });
        });

        it('should be 0 if all URLs return good responses', function(done) {
            given().aConfigFile()
                .withUrl('http://localhost:55557/200')
                .withUrl('http://localhost:55557/204')
            .when().iRunTheApplication()
            .then(function(exitCode) {
                assert.equal(0, exitCode);
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
                assert.equal(2, exitCode);
                done();
            });
        });
    });
});
