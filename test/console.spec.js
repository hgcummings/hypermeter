var assert = require('assert');
var helpers = require('./helpers.js');
var given = require('./builder.js').given;

describe('console reporter', function() {
    var server;

    before(function(done) {
        server = helpers.startServer(function(req, res) {
            res.statusCode = req.url.substring(1, 4);
            res.end();
        }, done);
    });

    after(function(done) {
        server.close(done);
    });

    it('lists URLs with status codes and response times', function(done) {
        given().aConfigFile()
            .withUrl('http://localhost:55557/200')
            .withUrl('http://localhost:55557/500')
            .withUrl('http://localhost:55557/204')
        .when()
            .iRunTheApplication()
        .then(function(exitCode, output) {
            var lines = output.split('\n');
            assert(containsRegex(lines, /http:\/\/localhost:55557\/200 returned 200, took [0-9]+ milliseconds/));
            assert(containsRegex(lines, /http:\/\/localhost:55557\/500 returned 500, took [0-9]+ milliseconds/));
            assert(containsRegex(lines, /http:\/\/localhost:55557\/204 returned 204, took [0-9]+ milliseconds/));
            done();
        });
    });

    it('lists failed URLs at the end', function(done) {
        given().aConfigFile()
            .withUrl('http://localhost:55557/200')
            .withUrl('http://localhost:55557/500')
            .withUrl('http://localhost:55557/503')
        .when()
            .iRunTheApplication()
        .then(function(exitCode, output) {
            var summaryLines = output.split('\n').slice(3);
            assert.equal('Failed URLs:', summaryLines[0]);
            assert(containsRegex(summaryLines, /http:\/\/localhost:55557\/500/));
            assert(containsRegex(summaryLines, /http:\/\/localhost:55557\/503/));
            done();
        });
    });

    it('does not report failured URLs if all URLs pass', function(done) {
        given().aConfigFile()
            .withUrl('http://localhost:55557/200')
            .withUrl('http://localhost:55557/204')
        .when()
            .iRunTheApplication()
        .then(function(exitCode, output) {
            var lines = output.split('\n');
            assert.equal('', lines[2]);
            done();
        });
    });

    var containsRegex = function(candidates, regex) {
        for (var i = 0; i < candidates.length; ++i) {
            if (regex.test(candidates[i])) {
                return true;
            }
        }
        return false;
    }
});