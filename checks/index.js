exports.create = function(config) {
    if (config) {
        var allChecks = [];
        for (var check in config) {
            if (config.hasOwnProperty(check)) {
                allChecks.push(require('./' + check + '.js').create(config[check]));
            };
        }

        return {
            check: function(url, response, time) {
                for (var i = 0; i < allChecks.length; ++i) {
                    if (!allChecks[i].check(url, response, time)) {
                        return false;
                    }
                }
                return true;
            }
        }
    } else {
        return require('./status.js').create();
    }
}
