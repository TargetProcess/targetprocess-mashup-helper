'use strict';

var configurator = require('tau/configurator');

var reg = configurator.getBusRegistry();

var makeCb = function(cb) {

    return function() {

        cb.apply(null, Array.prototype.slice.call(arguments).slice(1));

    };

};

var addBusListenerCommon = function(busName, eventName, listener, once, priority) {

    var localScope = {};

    var globalListener = makeCb(function(data) {

        var bus = data.bus;

        if (bus.name === busName) {

            bus[once ? 'once' : 'on'](eventName, listener, localScope, null, priority);

        }

    });

    var scope = reg.addEventListener('create', globalListener);

    reg.addEventListener('destroy', makeCb(function(data) {

        var bus = data.bus;

        if (bus.name === busName) {

            bus.removeListener(eventName, listener, scope);

        }

    }));

    return {
        remove: function() {

            reg.removeListener('create', globalListener, scope);
            reg.getByName(busName).then(function(bus) {

                bus.removeListener(eventName, listener, localScope);

            });

        }
    };

};

var addBusListener = function(busName, eventName, listener, priority) {

    return addBusListenerCommon(busName, eventName, listener, false, priority);

};

var addBusListenerOnce = function(busName, eventName, listener, priority) {

    return addBusListenerCommon(busName, eventName, listener, true, priority);

};

module.exports = {
    addBusListener: addBusListener,
    addBusListenerOnce: addBusListenerOnce
};
