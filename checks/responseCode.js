exports.create = function() {
    return {
        check: function(url, response) {
            return (parseInt(response.status, 10) < 400);
        }
    }
};
