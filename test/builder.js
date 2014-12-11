var fs = require('fs');
var child_process = require('child_process');
var Q = require('q');
var http = require('http');

var SERVER_PORT = 55557;

var randomInt = function() {
    return Math.round(Math.random() * 100000);
}

var arrangeBuilder = function(actBuilder) {
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
        responses[path] = status;
        return self;
    }

    self.withClientCert = function(path) {
        config.client = config.client || {};
        config.client.cert = path;
        return self;
    }

    var setup = function() {
        filename = randomInt() + '.json';
        fs.writeFileSync(filename, JSON.stringify(config));
        server = http.createServer(function(req, res) {
            res.statusCode = responses[req.url.substring(1)];
            res.end();
        });

        return Q.ninvoke(server, 'listen', SERVER_PORT, 'localhost', 8)
        .then(function() {
            return filename;
        });
    }

    self.when = function() {
        return actBuilder(setup, cleanup, config);
    }

    self.then = function(verify) {
        return setup().then(verify).then(cleanup);
    };

    var cleanup = function(callback) {
        return Q.all([Q.nfcall(fs.unlink, filename), Q.ninvoke(server, 'close')]).then(callback).done();
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
