var fs = require('fs');
var exit = require('exit');

var config = require(fs.realpathSync(process.argv[2]));
var http = require('http');
var Q = require('q');
var HTTP = require("q-io/http");

var requests = [];
var failedUrls = [];
config.urls.forEach(function(url) {
    var start = process.hrtime();
    requests.push(HTTP.request(url).then(function(response) {
        var diff = process.hrtime(start);
        var millis = diff[0] * 1e3 + Math.round(diff[1] / 1e6);
        console.log(url + ' returned %s, took %d milliseconds', response.status, millis);
        if(parseInt(response.status) >= 400) {
            failedUrls.push(url);
        }
    }));
});

Q.all(requests).then(function() {
    exit(failedUrls.length);
});
