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

    self.then = function(verify) {
        verify(self.build()).then(cleanup).done();
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
        var args = ['index.js'];
        if (configFilename) {
            args.push(configFilename);
        }

        var child = child_process.spawn('node', args);
        var output = '';
        var errorOutput = '';
        child.stdout.on('data', function (data) {
            output += data.toString();
        });

        child.stderr.on('data', function (data) {
            errorOutput += data;
        });

        child.on('close', function(exitCode) {
            var remainingOutput = child.stdout.read();
            if (remainingOutput) {
                output += remainingOutput;
            }

            if (configCleanup) {
                configCleanup(function() {
                    callback(exitCode, output, errorOutput);
                });
            } else {
                callback(exitCode, output, errorOutput);
            }
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

module.exports.when = actBuilder;
