'use strict';

var configurator = require('tau/configurator');

var reg = configurator.getBusRegistry();

var makeCb = function(cb) {

    return function() {

        cb.apply(null, Array.prototype.slice.call(arguments).slice(1));

    };

};

var addBusListener = function(busName, eventName, listener, once) {

    var globalListener = makeCb(function(data) {

        var bus = data.bus;

        if (bus.name === busName) {

            bus[once ? 'once' : 'on'](eventName, listener);

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

                bus.removeListener(eventName, listener, scope);

            });

        }
    };

};

var addBusListenerOnce = function(busName, eventName, listener) {

    return addBusListener(busName, eventName, listener, true);

};

module.exports = {
    addBusListener: addBusListener,
    addBusListenerOnce: addBusListenerOnce
};
