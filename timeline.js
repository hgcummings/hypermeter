var config = require('./config.json');
var http = require('http');
var Q = require('q');
var HTTP = require("q-io/http");

var requests = [];
var failures = [];
config.urls.forEach(function(url) {
    var start = process.hrtime();
    requests.push(HTTP.request(url)
        .then(function(response) {
            var diff = process.hrtime(start);
            console.log(url + ' returned %s, took %d milliseconds',
                response.status, diff[0] * 1e3 + Math.round(diff[1] / 1e6));
            if (parseInt(response.status, 10) >= 400) {
                failures.push(url);
            }
        })
        .fail(function(err) {
            console.log(err);
            failures.push(url);
        }));
});

Q.all(requests).then(function() {
    if (failures.length > 0) {
        console.log('FAILED URLs:')
        console.log(failures);
    }
    process.exit(failures.length);
}).fail(function(err) {
    console.log('Error');
    console.log(err);
    process.exit(1);
});
