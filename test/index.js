'use strict';

var expect = require('chai')
    .expect;
var proxyquire = require('proxyquire').noCallThru();

var fakeEvents = {
    addBusListener: function() {},
    addBusListenerOnce: function() {}
};

var fakeConfigurator = {
    getAppConfigurator: function() {}
};

var fakeCustomUnits = {};

var fakeDebug = {};

var api = proxyquire('../index', {
    './lib/events': fakeEvents,
    './lib/configurator': fakeConfigurator,
    './lib/customUnits': fakeCustomUnits,
    './lib/debug': fakeDebug
});

describe('main api entry point', function() {

    it('has methods and properties', function() {

        expect(api.addBusListener)
            .to.be.eql(fakeEvents.addBusListener);

        expect(api.addBusListenerOnce)
            .to.be.eql(fakeEvents.addBusListenerOnce);

        expect(api.getAppConfigurator)
            .to.be.eql(fakeConfigurator.getAppConfigurator);

        expect(api.events).to.be.eql(fakeEvents);
        expect(api.customUnits).to.be.eql(fakeCustomUnits);
        expect(api.configurator).to.be.eql(fakeConfigurator);
        expect(api.debug).to.be.eql(fakeDebug);

    });

});
