var fs = require('fs');
var assert = require('assert');
var helpers = require('./helpers.js');

describe('config', function() {
    var configFilename;
    var server;
    var visitedUrls;

    beforeEach(function() {
        configFilename = helpers.configFilename();
        visitedUrls = [];
    });

    afterEach(function(done) {
        fs.unlink(configFilename, done);
    })

    before(function(done) {
        server = helpers.startServer(function(req, res) {
            res.statusCode = 200;
            visitedUrls.push(req.url);
            res.end();
        }, done);
    });

    after(function(done) {
        server.close(done);
    });

    it('reads all urls from file', function(done) {
        var config = {
            urls: [
              "http://localhost:55557/one",
              "http://localhost:55557/two",
              "http://localhost:55557/three"
            ]
        };

        fs.writeFile(configFilename, JSON.stringify(config), function() {
            helpers.run([configFilename], function(exitCode) {
                assert.equal(0, exitCode);
                assert.equal(3, visitedUrls.length);
                done();
            });
        });
    })
});
