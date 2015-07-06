'use strict';

var expect = require('chai')
    .expect;

var sinon = require('sinon');
var getBusRegistry = sinon.spy(function() {});

var proxyquire = require('proxyquire').noCallThru();
var events = proxyquire('../lib/events', {
    'tau/configurator': {
        getBusRegistry: getBusRegistry
    }
});

before(function() {

    process.on('unhandledRejection', function(err) {

        throw err;

    });

});

describe('.events', function() {

    afterEach(function() {

        getBusRegistry.reset();

    });

    it('calls getBusRegistry on init', function() {

        expect(getBusRegistry.callCount)
            .to.be.equal(1);

    });

    it('has API', function() {

        expect(events)
            .to.have.keys('addBusListener', 'addBusListenerOnce');

    });

});
