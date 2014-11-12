var child_process = require('child_process');
var http = require('http');

module.exports.SERVER_PORT = 55557;

module.exports.startServer = function(requestListener, callback) {
  var server = http.createServer(requestListener);
  server.listen(module.exports.SERVER_PORT, 'localhost', 8, callback);
  return server;
}
