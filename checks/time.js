module.exports.create = function(limit) {
    return {
        check: function(url, response, time) {
            return time <= limit;
        }
    }
}
