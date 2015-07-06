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

module.exports = {
    showComponentsNames: showComponentsNames
};
