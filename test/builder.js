var fs = require('fs');
var child_process = require('child_process');
var Q = require('q');
var http = require('http');
var randomInt = require('./utils.js').randomInt;

var SERVER_PORT = 55557;

var arrangeBuilder = function(actBuilder, writeFile) {
    var config = { urls: [] };
    var self = {};
    var filename;
    var server;
    var responses = {};

    self.withUrl = function(url) {
        config.urls.push(url);
        return self;
    }

    self.withUrlThatReturnsStatus = function(status) {
        var path = randomInt();
        config.urls.push('http://localhost:' + SERVER_PORT + '/' + path);
        responses[path] = function(response) {
            response.statusCode = status;
        };
        return self;
    }

    self.withUrlThatReturnsHeader = function(name, value) {
        var path = randomInt();
        config.urls.push('http://localhost:' + SERVER_PORT + '/' + path);
        responses[path] = function(response) {
            response.statusCode = 200;
            response.setHeader(name, value);
        };
        return self;
    }

    self.withClientCert = function(path) {
        config.client = config.client || {};
        config.client.cert = path;
        return self;
    }

    var setup = function() {
        if (writeFile) {
            filename = randomInt() + '.json';
            fs.writeFileSync(filename, JSON.stringify(config));
        }
        server = http.createServer(function(req, res) {
            responses[req.url.substring(1)](res);
            res.end();
        });

        return Q.ninvoke(server, 'listen', SERVER_PORT, 'localhost', 8)
        .then(function() {
            return writeFile ? filename : config;
        });
    }

    self.when = function() {
        return actBuilder(setup, cleanup, config);
    }

    self.then = function(verify) {
        return setup().then(verify).then(cleanup);
    };

    var cleanup = function(callback) {
        var cleanups = [Q.ninvoke(server, 'close')];
        if (writeFile) {
            cleanups.push(Q.nfcall(fs.unlink, filename));
        }

        return Q.all(cleanups).then(callback).done();
    }

    return self;
}

var actBuilder = function(configSetup, configCleanup, config) {
    var self = {};

    self.iRunTheApplication = function() {
        return {
            then: function(callback) {
                return runApplication(callback);
            }
        }
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
            return arrangeBuilder(actBuilder, true);
        },
        aConfig: function() {
            return arrangeBuilder()
        }
    }
};

module.exports.when = function() {
    return actBuilder(function() { return Q(null); });
}
