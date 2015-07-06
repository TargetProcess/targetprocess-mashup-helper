'use strict';

var expect = require('chai')
    .expect;

var sinon = require('sinon');
var getBusRegistry = sinon.spy(function() {});

var proxyquire = require('proxyquire').noCallThru();
var debug = proxyquire('../lib/debug', {
    'tau/configurator': {
        getBusRegistry: getBusRegistry
    }
});

before(function() {

    process.on('unhandledRejection', function(err) {

        throw err;

    });

});

describe('.debug', function() {

    afterEach(function() {

        getBusRegistry.reset();

    });

    it('calls getBusRegistry on init', function() {

        expect(getBusRegistry.callCount)
            .to.be.equal(1);

    });

    it('has API', function() {

        expect(debug)
            .to.have.keys('showComponentsNames');

    });

});
