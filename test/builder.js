var fs = require('fs');
var helpers = require('./helpers.js');
var child_process = require('child_process');

var configFileBuilder = function(actBuilder) {
    var config = { urls: [] };
    var self = {};
    var filename;

    self.withUrl = function(url) {
        config.urls.push(url);
        return self;
    }

    self.withClientCert = function(path) {
        config.client = config.client || {};
        config.client.cert = path;
        return self;
    }

    self.build = function() {
        filename = Math.round(Math.random() * 100000) + '.json';
        fs.writeFileSync(filename, JSON.stringify(config));
        return filename;
    }

    self.when = function() {
        return actBuilder(self.build(), cleanup);
    }

    self.then = function(verify, done) {
        verify(self.build());
        cleanup(done);
    };

    var cleanup = function(callback) {
        fs.unlink(filename, callback);
    }

    return self;
}

var actBuilder = function(configFilename, configCleanup) {
    var self = {};

    self.iRunTheApplication = function() {
        return self;
    }

    self.then = function(callback) {
        return runApplication(callback);
    }

    var runApplication = function(callback) {
        var child = child_process.spawn('node', ['index.js', configFilename]);
        var output = '';
        child.stdout.on('data', function (data) {
            output += data.toString();
        });

        child.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(exitCode) {
            var remainingOutput = child.stdout.read();
            if (remainingOutput) {
                output += remainingOutput;
            }

            configCleanup(function() {
                callback(exitCode, output);
            });
        });
    }

    return self;
}

module.exports.given = function() {
    return {
        aConfigFile: function() {
            return configFileBuilder(actBuilder);
        }
    }
};
