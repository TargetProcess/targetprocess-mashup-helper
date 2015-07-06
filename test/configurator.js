'use strict';

var expect = require('chai')
    .expect;

var sinon = require('sinon');
var getGlobalBusOnce = sinon.spy(function() {});

var proxyquire = require('proxyquire').noCallThru();
var configurator = proxyquire('../lib/configurator', {
    'tau/configurator': {
        getGlobalBus: function() {

            return {
                once: getGlobalBusOnce
            };

        }
    },
    jQuery: {
        Deferred: function() {

            var res;

            return {
                resolve: function(a) {

                    res = a;

                },
                promise: function() {

                    return Promise.resolve(res);

                }
            };

        }
    }
});

before(function() {

    process.on('unhandledRejection', function(err) {

        throw err;

    });

});

describe('.configurator', function() {

    it('calls .getGlobalBus().once on init', function() {

        expect(getGlobalBusOnce.callCount)
            .to.be.equal(1);

    });

    it('.getAppConfigurator()', function(next) {

        expect(getGlobalBusOnce.firstCall.args[0])
            .to.be.eql('configurator.ready');
        expect(getGlobalBusOnce.firstCall.args[1])
            .to.be.instanceof(Function);

        getGlobalBusOnce.firstCall.args[1](null, 'dummyConfigurator');

        configurator.getAppConfigurator().then(function(res) {

                expect(res)
                    .to.be.eql('dummyConfigurator');
                next();

            });

    });

});
