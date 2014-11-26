#! /usr/bin/env node

var exit = require('exit');
var log = require('loglevel');
var client = require('./client.js');
var reporters = require('./reporters');
var checker = require('./checker.js');
var runner = require('./runner.js');

if (process.env.LOG_LEVEL) {
    log.setLevel(process.env.LOG_LEVEL);
} else {
    log.setLevel(log.levels.WARN);
}

var config = require('./config.js').load(process.argv[2]);

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
