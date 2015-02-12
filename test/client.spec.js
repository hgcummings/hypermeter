var clientFactory = require('../client.js');
var given = require('./builder.js').given;
var expect = require('chai').expect;

describe('client', function() {
    it('retrieves status code', function(done) {
        given().aConfig().withUrlThatReturnsStatus(418).then(function(config) {
            var client = clientFactory.create(true);
            return client.request(config.urls[0]).then(function(response) {
                expect(response.status).to.eq('418');
            });
        })
        .then(done).done();
    });

    it('retrieves headers', function(done) {
        given().aConfig().withUrlThatReturnsHeader('Foo', 'Bar').then(function(config) {
            var client = clientFactory.create(true);
            return client.request(config.urls[0]).then(function(response) {
                expect(response.headers['Foo']).to.eq('Bar');
            })
        })
        .then(done).done();
    });
})
