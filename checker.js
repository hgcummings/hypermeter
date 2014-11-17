exports.create = function() {
    var self = {};

    self.failures = [];
    self.check = function(url, response) {
        if(parseInt(response.status) >= 400) {
            self.failures.push(url);
        }
    }

    return self;
}
