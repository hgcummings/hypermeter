var Q = require('q');

module.exports.allWithDescendants = function(promises) {
    var deferred = Q.defer();

    var check = function() {
        if (promises.filter(Q.isPending).length) {
            Q.when(Q.all(promises), check, deferred.reject);
        } else {
            deferred.resolve(promises);
        }
    }

    check();

    return deferred.promise;
}
