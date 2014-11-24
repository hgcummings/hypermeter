#! /usr/bin/env node

var fs = require('fs');
var exit = require('exit');
var log = require('loglevel');
var config = require(fs.realpathSync(process.argv[2]));
var client = require('./client.js');
var reporters = require('./reporters');
var checker = require('./checker.js');
var runner = require('./runner.js');

if (process.env.LOG_LEVEL) {
    log.setLevel(process.env.LOG_LEVEL);
} else {
    log.setLevel(log.levels.ERROR);
}

runner.run(
    client.create(config.client),
    config.urls,
    reporters.create(config.reporters),
    checker.create(config.checker))
.then(function(failedUrls) {
    exit(failedUrls.length);
})
.fail(function(error) {
    log.error(error);
})
.done();
