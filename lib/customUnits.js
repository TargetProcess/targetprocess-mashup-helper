'use strict';

var $ = require('jQuery');
var types = require('tau/models/board.customize.units/const.entity.types.names');
var sizes = require('tau/models/board.customize.units/const.card.sizes');
var openUnitEditor = require('tau/models/board.customize.units/board.customize.units.interaction').openUnitEditor;

var configuratorHelper = require('./configurator');

function shallowCopy(source) {
    return Object.keys(source || {}).reduce(function(res, key) {
        res[key] = source[key];
        return res;
    }, {});
}

function reject(message) {
    var error = {message: message};

    if (typeof Promise !== 'undefined') {
        return Promise.reject(error);
    }

    return (new $.Deferred()).reject(error).promise();
}

function add(sourceUnit) {
    var unit = shallowCopy(sourceUnit);

    unit.types = unit.types || [types.ANY_TYPE];
    unit.sizes = unit.sizes || Object.keys(sizes).map(function(k) {
        return sizes[k];
    });

    return configuratorHelper
        .getAppConfigurator()
        .then(function(configurator) {
            var registry = configurator.getUnitsRegistry();
            var message;

            if (!unit.id) {
                message = 'Field "id" is required for custom unit config';
                console.error(message, unit);
                return reject(message);
            }

            if (registry.units[unit.id]) {
                message = 'Custom unit with id "' + unit.id + '" has been already registered';
                console.error(message,
                    '\nRegistered unit:', registry.units[unit.id],
                    '\nNew unit:', unit);
                return reject(message);
            }

            unit.name = unit.name || unit.id;

            unit.model = (unit.model || unit.sampleData) ? unit.model : {dummy: 1};
            if (typeof unit.model === 'object') {
                unit.model = Object.keys(unit.model).reduce(function(res, v) {
                    return res.concat(v + ':' + unit.model[v]);
                }, []).join(', ');
            }

            unit.sampleData = unit.sampleData || {};

            unit.template = (typeof sourceUnit.template === 'object') ? shallowCopy(unit.template) : (unit.template || {
                markup: ['<div class="tau-board-unit__value">' + unit.id + '</div>']
            });

            if (typeof unit.template === 'string') {
                unit.template = {
                    markup: [unit.template]
                };
            }

            if (typeof unit.template.markup === 'string') {
                unit.template.markup = [unit.template.markup];
            }

            if (unit.outerClassName) {
                unit.classId = unit.outerClassName;
            }

            if (unit.priority) {
                unit.priority = Number(unit.priority);
            }

            if (unit.isEditable) {
                unit.interactionConfig = {
                    isEditable: unit.isEditable
                };

                if (unit.editorHandler) {
                    unit.interactionConfig.handler = unit.editorHandler;
                } else {
                    unit.interactionConfig.handler = function(cardData, environment) {
                        var data = cardData.cardDataForUnit;

                        var editorComponentName = unit.editorComponentName instanceof Function ?
                            unit.editorComponentName(data) :
                            unit.editorComponentName;

                        var editor = openUnitEditor(editorComponentName, {});

                        if (unit.editorData) {
                            var cardDataForUnit = {};

                            Object.keys(unit.editorData).forEach(function(k) {
                                var v = unit.editorData[k];

                                cardDataForUnit[k] = v instanceof Function ? v(data) : data[v];
                            });

                            cardData.cardDataForUnit = cardDataForUnit;
                        }

                        return editor(cardData, environment);
                    };
                }
            }

            registry.units[unit.id] = registry.register([unit])[unit.id];
        });
}

module.exports = {
    types: types,
    sizes: sizes,
    add: add
};
