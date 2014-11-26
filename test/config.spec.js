var assert = require('assert');
var helpers = require('./helpers.js');
var given = require('./builder.js').given;
var config = require('../config.js');

describe('config', function() {
    it('reads all urls from file', function(done) {
        given().aConfigFile()
            .withUrl('http://localhost:55557/one')
            .withUrl('http://localhost:55557/two')
            .withUrl('http://localhost:55557/three')
        .then(function(configFilename) {
            var loaded = config.load(configFilename);
            assert.equal(3, loaded.urls.length);
        }, done);
    });

    it('parses environment variables', function(done) {
        var certPath = '/path/to/cert.pem';
        process.env['CLIENT_CERT'] = certPath;

        given().aConfigFile()
            .withClientCert('$CLIENT_CERT')
        .then(function(configFilename) {
            var loaded = config.load(configFilename);
            assert.equal(loaded.client.cert, certPath);
        }, done);
    });
});
