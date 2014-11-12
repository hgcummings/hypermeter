var assert = require('assert');
var helpers = require('./helpers.js');
var given = require('./builder.js').given;

describe('config', function() {
    var server;
    var visitedUrls;

    beforeEach(function() {
        visitedUrls = [];
    });

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
        given().aConfigFile()
            .withUrl('http://localhost:55557/one')
            .withUrl('http://localhost:55557/two')
            .withUrl('http://localhost:55557/three')
        .when()
            .iRunTheApplication()
        .then(function(exitCode) {
            assert.equal(0, exitCode);
            assert.equal(3, visitedUrls.length);
            assert.notEqual(-1, visitedUrls.indexOf('/one'));
            assert.notEqual(-1, visitedUrls.indexOf('/two'));
            assert.notEqual(-1, visitedUrls.indexOf('/three'));
            done();
        });
    });
});
