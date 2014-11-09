var config = require('./config.json');
var http = require('http');
var Q = require('q');
var HTTP = require("q-io/http");

HTTP.request(config.urls[0]).then(function(response) {
    if(parseInt(response.status) >= 400) {
        process.exit(1);
    } else {
        process.exit(0);
    }
});
