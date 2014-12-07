var helpers = require('./helpers.js');
var given = require('./builder.js').given;
var expect = require('chai').use(require('chai-things')).expect;

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
            expect(lines).include.one.to.match(/http:\/\/localhost:55557\/200 returned 200, took [0-9]+ milliseconds/);
            expect(lines).include.one.to.match(/http:\/\/localhost:55557\/500 returned 500, took [0-9]+ milliseconds/);
            expect(lines).include.one.to.match(/http:\/\/localhost:55557\/204 returned 204, took [0-9]+ milliseconds/);
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
            expect(summaryLines[0]).to.eq('Failed URLs:');
            expect(summaryLines).include.one.to.match(/http:\/\/localhost:55557\/500/);
            expect(summaryLines).include.one.to.match(/http:\/\/localhost:55557\/503/);
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
            expect(lines[2]).to.eq('');
            done();
        });
    });
});
