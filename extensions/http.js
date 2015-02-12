module.exports.getHeader = function(response, headerName) {
    for (var header in response.headers) {
        if (header.toLowerCase() === headerName.toLowerCase()) {
            return response.headers[header];
        }
    }
}
