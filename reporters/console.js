var Q = require('q');

exports.create = function() {
    return {
        report: function(url, response, time) {
            console.log(url + ' returned %s, took %d milliseconds', response.status, time);
        },
        summarise: function(passes, failures) {
            if (failures && failures.length) {
                console.log('Failed URLs:');
                failures.forEach(function(failure) {
                    console.log(failure);
                });
            }
            return Q('Done');
        }
    };
}
