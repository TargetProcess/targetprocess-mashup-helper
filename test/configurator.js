'use strict';

var jquery = require('jquery-deferred');

var expect = require('chai')
    .expect;
var sinon = require('sinon');

var getGlobalBusOn = sinon.spy(function() {});

var proxyquire = require('proxyquire').noCallThru();
var configurator = proxyquire('../lib/configurator', {
    'tau/configurator': {
        getGlobalBus: function() {

            return {
                on: getGlobalBusOn
            };

        }
    },
    jQuery: {
        Deferred: jquery.Deferred
    }
});

before(function() {

    process.on('unhandledRejection', function(err) {

        throw err;

    });

});

describe('.configurator', function() {

    it('calls .getGlobalBus().on on init', function() {

        expect(getGlobalBusOn.callCount)
            .to.be.equal(1);

    });

    it('.getAppConfigurator()', function() {

        expect(getGlobalBusOn.firstCall.args[0])
            .to.be.eql('configurator.ready');
        expect(getGlobalBusOn.firstCall.args[1])
            .to.be.instanceof(Function);

        var configuratorCallback = sinon.spy();

        configurator.getAppConfigurator().then(configuratorCallback);

        getGlobalBusOn.firstCall.args[1](null, {
            _id: 'global'
        });
        getGlobalBusOn.firstCall.args[1](null, {
            _id: 'board',
            id: 1
        });
        getGlobalBusOn.firstCall.args[1](null, {
            _id: 'board',
            id: 2
        });
        getGlobalBusOn.firstCall.args[1](null, {});

        expect(configuratorCallback.calledOnce)
            .to.be.true;

        expect(configuratorCallback.firstCall.args[0])
            .to.be.eql({
                _id: 'board',
                id: 1
            });

    });

});
