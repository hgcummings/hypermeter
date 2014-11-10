var fs = require('fs');

var config = require(fs.realpathSync(process.argv[2]));
var http = require('http');
var Q = require('q');
var HTTP = require("q-io/http");

var requests = [];
var failed = false;
config.urls.forEach(function(url) {
    requests.push(HTTP.request(config.urls[0]).then(function(response) {
        if(parseInt(response.status) >= 400) {
            failed = true;
        }
    }));
});

Q.all(requests).then(function() {
    if (failed) {
        process.exit(1);
    } else {
        process.exit(0);
    }
});
