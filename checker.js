exports.create = function() {
    var self = {};

    self.passes = [];
    self.failures = [];
    self.check = function(url, response) {
        if(parseInt(response.status) < 400) {
            self.passes.push(url);
            return true;
        } else {
            self.failures.push(url);
            return false;
        }
    }

    return self;
}
