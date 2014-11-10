var fs = require('fs');
var assert = require('assert');
var helpers = require('./helpers.js');

describe('returnCode', function() {
    var responseCode = 200;
    var server;
    var configFilename;

    beforeEach(function(done) {
        configFilename = helpers.configFilename();
        fs.writeFile(configFilename, JSON.stringify(
          { urls: ['http://localhost:55557/']}), done);
    });

    afterEach(function(done) {
        fs.unlink(configFilename, done);
    })

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
        helpers.run([configFilename], function(exitCode) {
            assert.equal(0, exitCode);
            done();
        });
    });

    it('should be 1 if only URL returns a bad response', function(done) {
        responseCode = 500;
        helpers.run([configFilename], function(exitCode) {
            assert.equal(1, exitCode);
            done();
        });
    });
})
