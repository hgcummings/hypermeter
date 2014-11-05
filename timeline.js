var config = require('./config.json');
var http = require('http');

config.urls.forEach(function(url) {
  var start = process.hrtime();
  http.get(url, function(res) {
    var diff = process.hrtime(start);
    console.log(url + ' took %d milliseconds', diff[0] * 1e3 + diff[1] / 1e6);
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});
