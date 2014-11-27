#! /usr/bin/env node

var log = require('loglevel');
var runner = require('./runner.js');
var client = require('./client.js');
var reporters = require('./reporters');
var checks = require('./checks');
var exit = require('exit');

if (process.env.LOG_LEVEL) {
    log.setLevel(process.env.LOG_LEVEL);
} else {
    log.setLevel(log.levels.WARN);
}

require('./config.js').load(process.argv[2])
.then(function(config) {
    return runner.run(
        client.create(config.client),
        config.urls,
        reporters.create(config.reporters),
        checks.create(config.checks));
})
.then(function(failedUrls) {
    exit(failedUrls.length);
})
.fail(function(error) {
    log.error(error);
    exit(1);
})
.done();
