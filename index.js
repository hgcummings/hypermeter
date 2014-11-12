var fs = require('fs');

var config = require(fs.realpathSync(process.argv[2]));
var http = require('http');
var Q = require('q');
var HTTP = require("q-io/http");

var requests = [];
var failedUrls = [];
config.urls.forEach(function(url) {
    requests.push(HTTP.request(url).then(function(response) {
        if(parseInt(response.status) >= 400) {
            failedUrls.push(url);
        }
    }));
});

Q.all(requests).then(function() {
    process.exit(failedUrls.length);
});
