var fs = require('fs');
var helpers = require('./helpers.js');
var child_process = require('child_process');

var configFileBuilder = function(actBuilder) {
    var config = { urls: [] };
    var self = {};

    self.withUrl = function(url) {
        config.urls.push(url);
        return self;
    }

    self.build = function() {
        var configFilename = Math.round(Math.random() * 100000) + '.json';
        fs.writeFileSync(configFilename, JSON.stringify(config));
        return configFilename;
    }

    self.when = function() {
        return actBuilder(self.build());
    }

    return self;
}

var actBuilder = function(configFilename, arrangeBuilder) {
    var self = {};

    self.iRunTheApplication = function() {
        return self;
    }

    self.then = function(callback) {
        return arrangeBuilder(callback, runApplication)
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

            fs.unlink(configFilename, function() {
                callback(exitCode, output);
            });
        });
    }

    return self;
}

module.exports.given = function() {
    var createActBuilder = function(configFilename) {
        return actBuilder(configFilename, function(assert, act) {
            act(assert);
        });
    }

    return {
        aConfigFile: function() {
          return configFileBuilder(createActBuilder);
        }
    }
};
