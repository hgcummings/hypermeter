var assert = require('assert');
var helpers = require('./helpers.js');
var given = require('./builder.js').given;

describe('returnCode', function() {
    var responseCode = 200;
    var server;
    var configFilename;

    before(function(done) {
        server = helpers.startServer(function(req, res) {
            res.statusCode = responseCode;
            res.end();
        }, done);
    });

    after(function(done) {
        server.close(done);
    });

    it('should be 0 if only URL returns good responses', function(done) {
        responseCode = 200;
        given().aConfigFile().withUrl('http://localhost:55557/')
        .when().iRunTheApplication()
        .then(function(exitCode) {
            assert.equal(0, exitCode);
            done();
        });
    });

    it('should be 1 if only URL returns a bad response', function(done) {
        responseCode = 500;
        given().aConfigFile().withUrl('http://localhost:55557/')
        .when().iRunTheApplication()
        .then(function(exitCode) {
            assert.equal(1, exitCode);
            done();
        });
    });
})
