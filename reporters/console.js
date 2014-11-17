exports.report = function(url, response, time) {
    var millis = time[0] * 1e3 + Math.round(time[1] / 1e6);
    console.log(url + ' returned %s, took %d milliseconds', response.status, millis);
};

exports.summarise = function(passes, failures) {
    if (failures && failures.length) {
        console.log('Failed URLs:');
        failures.forEach(function(failure) {
            console.log(failure);
        });
    }
};
