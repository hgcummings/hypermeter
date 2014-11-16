var fs = require('fs');
var exit = require('exit');
var config = require(fs.realpathSync(process.argv[2]));
var defaultReporter = require('./reporters/console.js');
var client = require('./client.js');
var runner = require('./runner.js');
var checker = require('./checker.js').init();

runner.run(client.init(config.client), config.urls, defaultReporter, checker)
    .then(function(failedUrls) {
        exit(failedUrls.length);
    }
);
