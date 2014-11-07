var config = require('./config.json');
var http = require('http');
var Q = require('q');
var HTTP = require("q-io/http");

var requests = [];
config.urls.forEach(function(url) {
    var start = process.hrtime();
    requests.push(HTTP.request(url).then(function(response) {
        var diff = process.hrtime(start);
        console.log(url + ' returned %s, took %d milliseconds',
            response.status, diff[0] * 1e3 + Math.round(diff[1] / 1e6));
    }));
});

Q.all(requests).then(process.exit);
