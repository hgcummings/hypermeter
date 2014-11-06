var config = require('./config.json');
var http = require('http');
var Q = require('q');
var HTTP = require("q-io/http");

var requests = [];
config.urls.forEach(function(url) {
    var start = process.hrtime();
    requests.push(HTTP.request(url).then(function() {
        var diff = process.hrtime(start);
        console.log(url + ' took %d milliseconds', diff[0] * 1e3 + diff[1] / 1e6);
    }));
});

Q.all(requests).then(process.exit);
