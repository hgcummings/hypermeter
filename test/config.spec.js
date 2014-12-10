var given = require('./builder.js').given;
var config = require('../config.js');
var expect = require('chai').expect;

describe('config', function() {
    it('returns an error if config file not found', function(done) {
        config.load('./filenotfound.json')
        .fail(function(error) {
            expect(error).to.exist();
            done();
        })
        .done();
    });

    it('returns an error if no config file specified', function(done) {
        config.load()
        .fail(function(error) {
            expect(error).to.contain('specify a config file');
            done();
        })
        .done();
    });

    it('reads all urls from file', function(done) {
        given().aConfigFile()
            .withUrl('http://localhost:55557/one')
            .withUrl('http://localhost:55557/two')
            .withUrl('http://localhost:55557/three')
        .then(function(configFilename) {
            return config.load(configFilename).then(function(loaded) {
                expect(loaded.urls.length).to.equal(3);
            });
        }).then(done).done();;
    });

    it('parses environment variables', function(done) {
        var certPath = '/path/to/cert.pem';
        process.env['CLIENT_CERT'] = certPath;

        given().aConfigFile()
            .withClientCert('$CLIENT_CERT')
        .then(function(configFilename) {
            return config.load(configFilename).then(function(loaded) {
                expect(loaded.client.cert).to.equal(certPath);
            });
        }).then(done).done();
    });
});
