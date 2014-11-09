var assert = require('assert');
var http = require('http');
var child_process = require('child_process');

describe('returnCode', function() {
    var responseCode = 200;
    var server;

    before(function(done) {
        server = http.createServer(function(req, res) {
            res.statusCode = responseCode;
            res.end();
        });
        server.listen(55557, 'localhost', 8, done);
    });

    after(function(done) {
        server.close(done);
    });

    it('should be 0 if only URL returns good responses', function(done) {
        responseCode = 200;
        run(function(exitCode) {
            assert.equal(0, exitCode);
            done();
        });
    });

    it('should be 1 if only URL returns a bad response', function(done) {
        responseCode = 500;
        run(function(exitCode) {
            assert.equal(1, exitCode);
            done();
        });
    });

    function run(callback) {
        var child = child_process.spawn('node', ['index.js']);        
        child.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
        });

        child.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });
        child.on('close', callback);
    }
})
