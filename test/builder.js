var fs = require('fs');
var helpers = require('./helpers.js');
var child_process = require('child_process');
var Q = require('q');

var arrangeBuilder = function(actBuilder) {
    var config = { urls: [] };
    var self = {};
    var filename;

    self.withUrl = function(url) {
        config.urls.push(url);
        return self;
    }

    self.withUrlThatReturnsStatus = function(status) {
        config.urls.push('http://localhost:55557/' + status);
        return self;
    }

    self.withClientCert = function(path) {
        config.client = config.client || {};
        config.client.cert = path;
        return self;
    }

    var setup = function() {
        filename = Math.round(Math.random() * 100000) + '.json';
        fs.writeFileSync(filename, JSON.stringify(config));
        return Q(filename);
    }

    self.when = function() {
        return actBuilder(setup, cleanup, config);
    }

    self.then = function(verify) {
        return setup().then(verify).then(cleanup);
    };

    var cleanup = function(callback) {
        fs.unlink(filename, callback);
    }

    return self;
}

var actBuilder = function(configSetup, configCleanup, config) {
    var self = {};

    self.iRunTheApplication = function() {
        return self;
    }

    self.then = function(callback) {
        return runApplication(callback);
    }

    var runApplication = function(callback) {
        configSetup().then(function(configFilename) {
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
                        callback(config, exitCode, output, errorOutput);
                    });
                } else {
                    callback(config, exitCode, output, errorOutput);
                }
            });
        }).done();
    }

    return self;
}

module.exports.given = function() {
    return {
        aConfigFile: function() {
            return arrangeBuilder(actBuilder);
        }
    }
};

module.exports.when = function() {
    return actBuilder(function() { return Q(null); });
}
