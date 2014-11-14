exports.report = function(url, response, time) {
    var millis = time[0] * 1e3 + Math.round(time[1] / 1e6);
    console.log(url + ' returned %s, took %d milliseconds', response.status, millis);
};
