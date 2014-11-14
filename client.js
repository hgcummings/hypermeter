var HTTP = require("q-io/http");

exports.request = function(url) {
    return HTTP.request(url);
};
