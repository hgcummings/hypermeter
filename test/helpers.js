var child_process = require('child_process');
var http = require('http');

module.exports.SERVER_PORT = 55557;

module.exports.startServer = function(requestListener, callback) {
  var server = http.createServer(requestListener);
  server.listen(module.exports.SERVER_PORT, 'localhost', 8, callback);
  return server;
}

module.exports.run = function(args, callback) {
    var child = child_process.spawn('node', ['index.js'].concat(args));
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
    child.on('close', callback);
};

module.exports.configFilename = function() {
  return Math.round(Math.random() * 100000) + '.json';
}
