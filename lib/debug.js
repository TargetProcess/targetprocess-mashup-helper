'use strict';

var configurator = require('tau/configurator');

var reg = configurator.getBusRegistry();

var showComponentsNames = function() {

    reg.on('create', function(e, data) {

        var bus = data.bus;

        bus.on('afterRender', function(renderEvent, renderData) {

            renderData.element.attr('data-component-name', bus.name);

        });

    });

};

var logBus = function(predicate, logger) {

    var predicateFunc = predicate;

    if (!predicate) {

        predicateFunc = function() {

            return true;

        };

    } else if (typeof predicate === 'string') {

        predicateFunc = function(bus) {

            return bus.id || bus.name === predicate;

        };

    }

    if (!logger) {

        logger = function(busName, eventName, data) {

            console.log('LOG BUS', busName, eventName, data);

        };

    }

    var globalBus = configurator.getGlobalBus();
    var fire = globalBus.fire.bind(globalBus);

    globalBus.fire = function(eventName, data, bus) {

        if (bus && predicateFunc(bus, eventName, data)) {

            logger(bus.id || bus.name, eventName, data);

        }

        return fire(eventName, data, bus);

    };

};

module.exports = {
    showComponentsNames: showComponentsNames,
    logBus: logBus
};
